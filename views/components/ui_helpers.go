package components

import (
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
