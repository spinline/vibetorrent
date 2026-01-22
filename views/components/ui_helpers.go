package components

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"
)

func FormatDate(timestamp int64) string {
	if timestamp == 0 {
		return "-"
	}
	return time.Unix(timestamp, 0).Format("Jan 02, 2006")
}

func getNavItemClass(active bool) string {
	if active {
		return "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer bg-primary/10 text-primary"
	}
	return "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer hover:bg-surface-dark text-slate-400"
}

func FormatBytes(bytes int64) string {
	if bytes == 0 {
		return "0 B"
	}
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := int64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

func FormatSpeed(bytesPerSec int) string {
	if bytesPerSec == 0 {
		return "0 KB/s"
	}
	return fmt.Sprintf("%s/s", FormatBytes(int64(bytesPerSec)))
}

func FormatETA(size, completed int64, rate int) string {
	if rate == 0 || size <= completed {
		return "∞"
	}
	remaining := size - completed
	seconds := remaining / int64(rate)

	if seconds < 60 {
		return fmt.Sprintf("%ds", seconds)
	}
	minutes := seconds / 60
	if minutes < 60 {
		return fmt.Sprintf("%dm", minutes)
	}
	hours := minutes / 60
	if hours < 24 {
		return fmt.Sprintf("%dh %dm", hours, minutes%60)
	}
	days := hours / 24
	return fmt.Sprintf("%dd %dh", days, hours%24)
}

func GetProgressColor(state string) string {
	switch state {
	case "seeding":
		return "bg-emerald-500"
	case "paused", "stopped":
		return "bg-orange-500"
	default:
		return "bg-primary"
	}
}

func GetProgressColorStyle(state string) string {
	switch state {
	case "seeding":
		return "background-color: #10b981;"
	case "paused", "stopped":
		return "background-color: #f97316;"
	default:
		return "background-color: #0d9488;"
	}
}

func GetStatusBadge(state string) string {
	color := "text-slate-500 bg-slate-500/10"
	icon := "help"

	switch state {
	case "downloading":
		color = "text-primary bg-primary/10"
		icon = "downloading"
	case "seeding":
		color = "text-emerald-500 bg-emerald-500/10"
		icon = "upload"
	case "paused":
		color = "text-orange-500 bg-orange-500/10"
		icon = "pause_circle"
	case "checking":
		color = "text-blue-500 bg-blue-500/10"
		icon = "sync"
	}

	return fmt.Sprintf(`<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium %s border border-transparent"><span class="material-symbols-outlined text-[14px]">%s</span>%s</span>`, color, icon, strings.Title(state))
}

func GetStatusText(state string) string {
	switch state {
	case "downloading":
		return `<span class="text-primary font-medium">İndiriliyor</span>`
	case "seeding":
		return `<span class="text-emerald-400 font-medium">Seeding</span>`
	case "paused":
		return `<span class="text-orange-400 font-medium">Duraklatıldı</span>`
	case "stopped":
		return `<span class="text-slate-500 font-medium">Durduruldu</span>`
	case "checking":
		return `<span class="text-blue-400 font-medium">Kontrol ediliyor</span>`
	default:
		return `<span class="text-slate-500 font-medium">` + strings.Title(state) + `</span>`
	}
}

func getStatusIcon(state string) string {
	switch state {
	case "downloading":
		return "download"
	case "seeding":
		return "check_circle"
	case "paused", "stopped":
		return "pause_circle"
	case "checking":
		return "sync"
	default:
		return "help"
	}
}

func getStatusIconBg(state string) string {
	switch state {
	case "downloading":
		return "bg-primary/20"
	case "seeding":
		return "bg-emerald-500/20"
	case "paused", "stopped":
		return "bg-orange-500/20"
	case "checking":
		return "bg-blue-500/20"
	default:
		return "bg-slate-700/50"
	}
}

func getStatusIconBgStyle(state string) string {
	switch state {
	case "downloading":
		return "background-color: rgba(13, 148, 136, 0.2);"
	case "seeding":
		return "background-color: rgba(16, 185, 129, 0.2);"
	case "paused", "stopped":
		return "background-color: rgba(249, 115, 22, 0.2);"
	case "checking":
		return "background-color: rgba(59, 130, 246, 0.2);"
	default:
		return "background-color: rgba(51, 65, 85, 0.5);"
	}
}

func getStatusIconColor(state string) string {
	switch state {
	case "downloading":
		return "text-primary"
	case "seeding":
		return "text-emerald-500"
	case "paused", "stopped":
		return "text-orange-500"
	case "checking":
		return "text-blue-500"
	default:
		return "text-slate-400"
	}
}

func getStatusIconColorStyle(state string) string {
	switch state {
	case "downloading":
		return "color: #0d9488;"
	case "seeding":
		return "color: #10b981;"
	case "paused", "stopped":
		return "color: #f97316;"
	case "checking":
		return "color: #3b82f6;"
	default:
		return "color: #94a3b8;"
	}
}

func countsToJSON(counts map[string]int) string {
	if counts == nil {
		counts = map[string]int{}
	}
	b, _ := json.Marshal(counts)
	return string(b)
}

func labelCountsToJSON(labelCounts map[string]int) string {
	if labelCounts == nil {
		labelCounts = map[string]int{}
	}
	b, _ := json.Marshal(labelCounts)
	return string(b)
}
