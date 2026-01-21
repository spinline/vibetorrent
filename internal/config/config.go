package config

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	RTorrent    RTorrentConfig    `mapstructure:"rtorrent"`
	Server      ServerConfig      `mapstructure:"server"`
	Downloads   DownloadsConfig   `mapstructure:"downloads"`
	Preferences PreferencesConfig `mapstructure:"preferences"`
	Security    SecurityConfig    `mapstructure:"security"`
}

type RTorrentConfig struct {
	Socket  string        `mapstructure:"socket"`
	Timeout time.Duration `mapstructure:"timeout"`
}

type ServerConfig struct {
	Port int    `mapstructure:"port"`
	Host string `mapstructure:"host"`
}

type DownloadsConfig struct {
	DefaultPath string `mapstructure:"default_path"`
	TempPath    string `mapstructure:"temp_path"`
}

type PreferencesConfig struct {
	Theme           string        `mapstructure:"theme"`
	ItemsPerPage    int           `mapstructure:"items_per_page"`
	RefreshInterval time.Duration `mapstructure:"refresh_interval"`
}

type SecurityConfig struct {
	AuthEnabled  bool   `mapstructure:"auth_enabled"`
	Username     string `mapstructure:"username"`
	PasswordHash string `mapstructure:"password_hash"`
}

var AppConfig *Config

// getConfigPath returns the path to the config file
func getConfigPath() string {
	// Try environment variable first
	if configPath := os.Getenv("VIBETORRENT_CONFIG"); configPath != "" {
		return configPath
	}

	// Try current directory
	if _, err := os.Stat("./config.yaml"); err == nil {
		return "./config.yaml"
	}

	// Try ~/.config/vibetorrent/config.yaml
	if home, err := os.UserHomeDir(); err == nil {
		configPath := filepath.Join(home, ".config", "vibetorrent", "config.yaml")
		return configPath
	}

	// Default to current directory
	return "./config.yaml"
}

// LoadConfig loads configuration from file and environment variables
func LoadConfig() (*Config, error) {
	configPath := getConfigPath()
	configDir := filepath.Dir(configPath)

	// Create config directory if it doesn't exist
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create config directory: %w", err)
	}

	// Set default values
	setDefaults()

	// Set config file
	viper.SetConfigFile(configPath)
	viper.SetConfigType("yaml")

	// Try to read config file (ignore file not found error)
	configExists := true
	err := viper.ReadInConfig()
	if err != nil {
		configExists = false
		// It's okay if config doesn't exist, we'll use defaults
	}

	// Environment variables override config file
	viper.AutomaticEnv()
	viper.SetEnvPrefix("VIBETORRENT")

	// Map environment variables
	viper.BindEnv("rtorrent.socket", "RTORRENT_SOCKET")
	viper.BindEnv("server.port", "PORT")
	viper.BindEnv("server.host", "HOST")

	// Unmarshal config
	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	// Create config file if it doesn't exist
	if !configExists {
		if err := createDefaultConfig(configPath); err != nil {
			// Log error but don't fail - we can still run with defaults
			fmt.Printf("Warning: Could not create config file: %v\n", err)
		}
	}

	AppConfig = &config
	return &config, nil
}

// setDefaults sets default configuration values
func setDefaults() {
	// RTorrent defaults
	viper.SetDefault("rtorrent.socket", "")
	viper.SetDefault("rtorrent.timeout", "30s")

	// Server defaults
	viper.SetDefault("server.port", 8080)
	viper.SetDefault("server.host", "0.0.0.0")

	// Downloads defaults
	viper.SetDefault("downloads.default_path", "/downloads")
	viper.SetDefault("downloads.temp_path", "/downloads/incomplete")

	// Preferences defaults
	viper.SetDefault("preferences.theme", "dark")
	viper.SetDefault("preferences.items_per_page", 50)
	viper.SetDefault("preferences.refresh_interval", "2s")

	// Security defaults
	viper.SetDefault("security.auth_enabled", false)
	viper.SetDefault("security.username", "admin")
	viper.SetDefault("security.password_hash", "")
}

// createDefaultConfig creates a default configuration file
func createDefaultConfig(path string) error {
	defaultConfig := `# VibeTorrent Configuration
# Generated automatically on first run

# rTorrent Connection Settings
rtorrent:
  # Socket path or TCP address
  # Examples: 
  #   - unix:///opt/var/rpc.socket
  #   - tcp://localhost:5000
  socket: ""
  timeout: 30s

# Web Server Settings
server:
  port: 8080
  host: "0.0.0.0"

# Download Paths
downloads:
  default_path: "/downloads"
  temp_path: "/downloads/incomplete"

# UI Preferences
preferences:
  theme: "dark"
  items_per_page: 50
  refresh_interval: 2s

# Security Settings (Future feature)
security:
  auth_enabled: false
  username: "admin"
  password_hash: ""
`

	if err := os.WriteFile(path, []byte(defaultConfig), 0644); err != nil {
		return err
	}

	fmt.Printf("✓ Created default config file: %s\n", path)
	return nil
}

// SaveConfig saves the current configuration to file
func SaveConfig() error {
	if AppConfig == nil {
		return fmt.Errorf("no config loaded")
	}

	viper.Set("rtorrent", AppConfig.RTorrent)
	viper.Set("server", AppConfig.Server)
	viper.Set("downloads", AppConfig.Downloads)
	viper.Set("preferences", AppConfig.Preferences)
	viper.Set("security", AppConfig.Security)

	return viper.WriteConfig()
}

// IsRTorrentConfigured checks if rTorrent connection is configured
func IsRTorrentConfigured() bool {
	return AppConfig != nil && AppConfig.RTorrent.Socket != ""
}
