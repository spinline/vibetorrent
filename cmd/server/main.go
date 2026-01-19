package main

import (
	"embed"
	"encoding/json"
	"io/fs"
	"log"
	"net/http"
	"os"
	"rtorrent-go/internal/rtorrent"
	"rtorrent-go/views/components"
	"sort"
	"strings"

	"io"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

//go:embed assets/*
var assets embed.FS

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// Determine rTorrent connection address
	// Priority: RTORRENT_SOCKET > RTORRENT_HOST:RTORRENT_PORT
	addr := os.Getenv("RTORRENT_SOCKET")
	if addr == "" {
		host := os.Getenv("RTORRENT_HOST")
		if host == "" {
			host = "localhost"
		}
		port := os.Getenv("RTORRENT_PORT")
		if port == "" {
			port = "8000"
		}
		addr = host + ":" + port
	}

	client := rtorrent.NewClient(addr)

	assetFS, _ := fs.Sub(assets, "assets")
	r.Handle("/assets/*", http.StripPrefix("/assets/", http.FileServer(http.FS(assetFS))))

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		filter := r.URL.Query().Get("filter")
		if filter == "" {
			filter = "all"
		}
		renderDashboardContainer(w, r, client, filter)
	})

	r.Get("/list_main", func(w http.ResponseWriter, r *http.Request) {
		filter := r.URL.Query().Get("filter")
		if filter == "" {
			filter = "all"
		}
		renderDashboardMainArea(w, r, client, filter)
	})

	r.Delete("/torrent/{hash}", func(w http.ResponseWriter, r *http.Request) {
		hash := chi.URLParam(r, "hash")
		// Check for deleteFiles parameter
		deleteFiles := r.URL.Query().Get("deleteFiles") == "true"

		if deleteFiles {
			// In jesec/rtorrent, d.erase also deletes data if configured,
			// but usually we might need to call something else or rely on rTorrent side.
			// For now, we use d.erase.
			if err := client.DeleteTorrent(r.Context(), hash); err != nil {
				log.Printf("Error deleting torrent with data: %v", err)
			}
		} else {
			if err := client.DeleteTorrent(r.Context(), hash); err != nil {
				log.Printf("Error deleting torrent: %v", err)
			}
		}

		filter := r.URL.Query().Get("filter")
		if filter == "" {
			filter = "all"
		}
		renderDashboardContainer(w, r, client, filter)
	})

	r.Post("/torrent/{hash}/start", func(w http.ResponseWriter, r *http.Request) {
		hash := chi.URLParam(r, "hash")
		client.StartTorrent(r.Context(), hash)
		renderDashboardContainer(w, r, client, "all")
	})

	r.Post("/torrent/{hash}/pause", func(w http.ResponseWriter, r *http.Request) {
		hash := chi.URLParam(r, "hash")
		client.PauseTorrent(r.Context(), hash)
		renderDashboardContainer(w, r, client, "all")
	})

	r.Post("/torrent/{hash}/stop", func(w http.ResponseWriter, r *http.Request) {
		hash := chi.URLParam(r, "hash")
		client.StopTorrent(r.Context(), hash)
		renderDashboardContainer(w, r, client, "all")
	})

	r.Post("/torrent/{hash}/recheck", func(w http.ResponseWriter, r *http.Request) {
		hash := chi.URLParam(r, "hash")
		client.RecheckTorrent(r.Context(), hash)
		renderDashboardContainer(w, r, client, "all")
	})

	r.Post("/torrent/{hash}/priority", func(w http.ResponseWriter, r *http.Request) {
		hash := chi.URLParam(r, "hash")
		var body struct {
			Priority int `json:"priority"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err == nil {
			client.SetPriority(r.Context(), hash, body.Priority)
		}
		renderDashboardContainer(w, r, client, "all")
	})

	r.Post("/torrent/{hash}/label", func(w http.ResponseWriter, r *http.Request) {
		hash := chi.URLParam(r, "hash")
		var body struct {
			Label string `json:"label"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err == nil {
			client.SetLabel(r.Context(), hash, body.Label)
		}
		renderDashboardContainer(w, r, client, "all")
	})

	r.Post("/torrent/add", func(w http.ResponseWriter, r *http.Request) {
		if err := r.ParseMultipartForm(32 << 20); err != nil {
			http.Error(w, "Failed to parse form", http.StatusBadRequest)
			return
		}

		sourceType := r.FormValue("source_type")
		downloadPath := r.FormValue("download_path")
		autoStart := r.FormValue("auto_start") == "on" || r.FormValue("auto_start") == "true"

		var err error
		if sourceType == "url" {
			url := r.FormValue("torrent_url")
			if url != "" {
				err = client.AddTorrentByUrl(r.Context(), url, autoStart, downloadPath)
			}
		} else {
			file, _, fErr := r.FormFile("torrent_file")
			if fErr == nil {
				defer file.Close()
				data, readErr := io.ReadAll(file)
				if readErr == nil {
					err = client.AddTorrentByData(r.Context(), data, autoStart, downloadPath)
				} else {
					err = readErr
				}
			}
		}

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		renderDashboardContainer(w, r, client, "all")
	})

	r.Get("/torrent/{hash}/details", func(w http.ResponseWriter, r *http.Request) {
		hash := chi.URLParam(r, "hash")

		torrent, err := client.GetTorrentDetails(r.Context(), hash)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}

		files, err := client.GetTorrentFiles(r.Context(), hash)
		if err != nil {
			// Even if files fail, we can show metadata
			files = []rtorrent.File{}
		}

		components.DetailContent(*torrent, files).Render(r.Context(), w)
	})

	r.Get("/settings", func(w http.ResponseWriter, r *http.Request) {
		components.SettingsPage().Render(r.Context(), w)
	})

	r.Get("/settings_main", func(w http.ResponseWriter, r *http.Request) {
		components.SettingsMainArea().Render(r.Context(), w)
	})

	r.Get("/list", func(w http.ResponseWriter, r *http.Request) {
		torrents, _ := client.GetTorrents(r.Context())
		filter := r.URL.Query().Get("filter")
		if filter == "" {
			filter = "all"
		}

		sortBy := r.URL.Query().Get("sort")
		order := r.URL.Query().Get("order")

		if sortBy != "" {
			http.SetCookie(w, &http.Cookie{
				Name:  "torrent_sort",
				Value: sortBy + ":" + order,
				Path:  "/",
			})
		} else {
			cookie, err := r.Cookie("torrent_sort")
			if err == nil {
				parts := strings.Split(cookie.Value, ":")
				if len(parts) == 2 {
					sortBy = parts[0]
					order = parts[1]
				}
			}
		}

		sortTorrents(torrents, sortBy, order)

		var filtered []rtorrent.Torrent
		for _, t := range torrents {
			shouldInclude := false
			switch filter {
			case "all":
				shouldInclude = true
			case "downloading", "seeding", "paused":
				shouldInclude = t.State == filter
			default:
				if len(filter) > 6 && filter[:6] == "label:" {
					shouldInclude = t.Label == filter[6:]
				}
			}
			if shouldInclude {
				filtered = append(filtered, t)
			}
		}

		if len(filtered) == 0 {
			components.TorrentTable([]rtorrent.Torrent{}, sortBy, order, filter).Render(r.Context(), w)
			return
		}

		components.TorrentTable(filtered, sortBy, order, filter).Render(r.Context(), w)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on :%s...", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}

func sortTorrents(torrents []rtorrent.Torrent, sortBy, order string) {
	sort.Slice(torrents, func(i, j int) bool {
		less := false
		a, b := torrents[i], torrents[j]

		switch sortBy {
		case "name":
			less = strings.ToLower(a.Name) < strings.ToLower(b.Name)
		case "size":
			less = a.Size < b.Size
		case "progress":
			less = a.Progress < b.Progress
		case "down":
			less = a.DownloadRate < b.DownloadRate
		case "up":
			less = a.UploadRate < b.UploadRate
		case "eta":
			// ETA is weird, simplified: smaller size-completed/rate is less
			// Treat 0 rate as max eta
			var etaA, etaB float64
			if a.DownloadRate > 0 {
				etaA = float64(a.Size-a.Completed) / float64(a.DownloadRate)
			} else {
				etaA = 1e15 // infinity
			}
			if b.DownloadRate > 0 {
				etaB = float64(b.Size-b.Completed) / float64(b.DownloadRate)
			} else {
				etaB = 1e15
			}
			less = etaA < etaB
		case "state":
			less = a.State < b.State
		default:
			return i < j
		}

		if order == "desc" {
			return !less
		}
		return less
	})
}
func getSidebarProps(r *http.Request, client rtorrent.Client, filter string) (components.SidebarProps, []rtorrent.Torrent) {
	torrents, err := client.GetTorrents(r.Context())
	if err != nil {
		return components.SidebarProps{}, nil
	}

	counts := map[string]int{"all": len(torrents)}
	labelCounts := make(map[string]int)
	labels := []string{}
	labelMap := make(map[string]bool)

	for _, t := range torrents {
		counts[t.State]++
		if t.Label != "" {
			labelCounts[t.Label]++
			if !labelMap[t.Label] {
				labels = append(labels, t.Label)
				labelMap[t.Label] = true
			}
		}
	}

	return components.SidebarProps{
		Counts:      counts,
		Labels:      labels,
		LabelCounts: labelCounts,
		Filter:      filter,
	}, torrents
}

func renderDashboardContainer(w http.ResponseWriter, r *http.Request, client rtorrent.Client, filter string) {
	sidebar, torrents := getSidebarProps(r, client, filter)

	// Sorting Logic
	sortBy := r.URL.Query().Get("sort")
	order := r.URL.Query().Get("order")

	// If params not in query, try reading from cookie
	if sortBy == "" {
		cookie, err := r.Cookie("torrent_sort")
		if err == nil {
			parts := strings.Split(cookie.Value, ":")
			if len(parts) == 2 {
				sortBy = parts[0]
				order = parts[1]
			}
		}
	} else {
		// If params provided in query, update cookie
		http.SetCookie(w, &http.Cookie{
			Name:  "torrent_sort",
			Value: sortBy + ":" + order,
			Path:  "/",
		})
	}

	var stats components.Stats
	var filtered []rtorrent.Torrent

	sortTorrents(torrents, sortBy, order)

	for _, t := range torrents {
		// Stats
		stats.DownloadSpeed += int64(t.DownloadRate)
		stats.UploadSpeed += int64(t.UploadRate)
		// Mock disk space for now
		stats.DiskTotal = 4 * 1024 * 1024 * 1024 * 1024 // 4TB
		stats.DiskFree = 2 * 1024 * 1024 * 1024 * 1024  // 2TB
		if t.DownloadRate > 0 || t.UploadRate > 0 {
			stats.Peers++
		}

		// Filtering
		shouldInclude := false
		switch filter {
		case "all":
			shouldInclude = true
		case "downloading", "seeding", "paused":
			shouldInclude = t.State == filter
		default:
			if len(filter) > 6 && filter[:6] == "label:" {
				shouldInclude = t.Label == filter[6:]
			}
		}

		if shouldInclude {
			filtered = append(filtered, t)
		}
	}

	props := components.DashboardProps{
		Torrents: filtered,
		Stats:    stats,
		Sidebar:  sidebar,
		SortBy:   sortBy,
		Order:    order,
	}

	// Full page load
	components.DashboardPage(props).Render(r.Context(), w)
}

func renderDashboardMainArea(w http.ResponseWriter, r *http.Request, client rtorrent.Client, filter string) {
	sidebar, torrents := getSidebarProps(r, client, filter)

	sortBy := r.URL.Query().Get("sort")
	order := r.URL.Query().Get("order")

	if sortBy == "" {
		cookie, err := r.Cookie("torrent_sort")
		if err == nil {
			parts := strings.Split(cookie.Value, ":")
			if len(parts) == 2 {
				sortBy = parts[0]
				order = parts[1]
			}
		}
	}

	var stats components.Stats
	var filtered []rtorrent.Torrent

	sortTorrents(torrents, sortBy, order)

	for _, t := range torrents {
		stats.DownloadSpeed += int64(t.DownloadRate)
		stats.UploadSpeed += int64(t.UploadRate)
		stats.DiskTotal = 4 * 1024 * 1024 * 1024 * 1024
		stats.DiskFree = 2 * 1024 * 1024 * 1024 * 1024
		if t.DownloadRate > 0 || t.UploadRate > 0 {
			stats.Peers++
		}

		shouldInclude := false
		switch filter {
		case "all":
			shouldInclude = true
		case "downloading", "seeding", "paused":
			shouldInclude = t.State == filter
		default:
			if len(filter) > 6 && filter[:6] == "label:" {
				shouldInclude = t.Label == filter[6:]
			}
		}

		if shouldInclude {
			filtered = append(filtered, t)
		}
	}

	props := components.DashboardProps{
		Torrents: filtered,
		Stats:    stats,
		Sidebar:  sidebar,
		SortBy:   sortBy,
		Order:    order,
	}

	components.DashboardMainArea(props).Render(r.Context(), w)
}
