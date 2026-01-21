package rtorrent

import (
	"bytes"
	"context"
	"encoding/xml"
	"fmt"
	"log"
	"net"
	"strings"
	"time"
)

// XML-RPC Structures
type MethodCall struct {
	XMLName    xml.Name `xml:"methodCall"`
	MethodName string   `xml:"methodName"`
	Params     []Param  `xml:"params>param"`
}

type Param struct {
	Value Value `xml:"value"`
}

func (v Value) GetLong() int64 {
	if v.Int != nil {
		return *v.Int
	}
	if v.I4 != nil {
		return *v.I4
	}
	if v.I8 != nil {
		return *v.I8
	}
	return 0
}

func (v Value) GetString() string {
	if v.String != nil {
		return *v.String
	}
	return ""
}

func (v Value) GetArray() []Value {
	if v.Array != nil {
		return v.Array.Data
	}
	return nil
}

type Value struct {
	String  *string   `xml:"string,omitempty"`
	Int     *int64    `xml:"int,omitempty"`
	I4      *int64    `xml:"i4,omitempty"`
	I8      *int64    `xml:"i8,omitempty"`
	Double  *float64  `xml:"double,omitempty"`
	Boolean *bool     `xml:"boolean,omitempty"`
	Base64  []byte    `xml:"base64,omitempty"`
	Array   *ValArray `xml:"array,omitempty"`
}

func (v Value) MarshalXML(e *xml.Encoder, start xml.StartElement) error {
	if v.String != nil {
		type temp struct {
			XMLName xml.Name `xml:"value"`
			String  string   `xml:"string"`
		}
		return e.Encode(temp{String: *v.String})
	}
	if v.Int != nil {
		type temp struct {
			XMLName xml.Name `xml:"value"`
			Int     int64    `xml:"int"`
		}
		return e.Encode(temp{Int: *v.Int})
	}
	if v.I4 != nil {
		type temp struct {
			XMLName xml.Name `xml:"value"`
			I4      int64    `xml:"i4"`
		}
		return e.Encode(temp{I4: *v.I4})
	}
	if v.Double != nil {
		type temp struct {
			XMLName xml.Name `xml:"value"`
			Double  float64  `xml:"double"`
		}
		return e.Encode(temp{Double: *v.Double})
	}
	if v.Boolean != nil {
		type temp struct {
			XMLName xml.Name `xml:"value"`
			Boolean bool     `xml:"boolean"`
		}
		return e.Encode(temp{Boolean: *v.Boolean})
	}
	if v.Base64 != nil {
		type temp struct {
			XMLName xml.Name `xml:"value"`
			Base64  []byte   `xml:"base64"`
		}
		return e.Encode(temp{Base64: v.Base64})
	}
	if v.Array != nil {
		type temp struct {
			XMLName xml.Name  `xml:"value"`
			Array   *ValArray `xml:"array"`
		}
		return e.Encode(temp{Array: v.Array})
	}
	// Fallback/Empty
	return e.Encode(struct {
		XMLName xml.Name `xml:"value"`
	}{})
}

type ValArray struct {
	Data []Value `xml:"data>value"`
}

type MethodResponse struct {
	Params []Param `xml:"params>param"`
	Fault  *Fault  `xml:"fault,omitempty"`
}

type Fault struct {
	Value Value `xml:"value"`
}

// Torrent matching our application's needs
type Torrent struct {
	Hash         string  `json:"hash"`
	Name         string  `json:"name"`
	Size         int64   `json:"size"`
	Completed    int64   `json:"completed"`
	DownloadRate int     `json:"download_rate"`
	UploadRate   int     `json:"upload_rate"`
	State        string  `json:"state"`
	Progress     float64 `json:"progress"`
	Label        string  `json:"label"`
	// Pro V2 Fields
	DateAdded  int64  `json:"date_added"`
	PieceCount int64  `json:"piece_count"`
	PieceSize  int64  `json:"piece_size"`
	SavePath   string `json:"save_path"`
	Priority   int    `json:"priority"`
}

type File struct {
	Name      string `json:"name"`
	Size      int64  `json:"size"`
	Completed int64  `json:"completed"`
	Priority  int    `json:"priority"`
}

type Client interface {
	TestConnection() error
	GetTorrents(ctx context.Context) ([]Torrent, error)
	DeleteTorrent(ctx context.Context, hash string) error
	GetTorrentFiles(ctx context.Context, hash string) ([]File, error)
	GetTorrentDetails(ctx context.Context, hash string) (*Torrent, error)
	AddTorrentByUrl(ctx context.Context, url string, autoStart bool, downloadPath string) error
	AddTorrentByData(ctx context.Context, data []byte, autoStart bool, downloadPath string) error
	StartTorrent(ctx context.Context, hash string) error
	PauseTorrent(ctx context.Context, hash string) error
	StopTorrent(ctx context.Context, hash string) error
	RecheckTorrent(ctx context.Context, hash string) error
	SetPriority(ctx context.Context, hash string, priority int) error
	SetLabel(ctx context.Context, hash string, label string) error
}

func NewClient(addr string) Client {
	if addr == "mock" {
		log.Println("Initializing rTorrent client in MOCK mode")
		return &mockClient{}
	}
	log.Printf("Initializing rTorrent client in REAL mode at %s", addr)
	return &xmlrpcClient{
		addr: addr,
	}
}

type xmlrpcClient struct {
	addr string
}

type mockClient struct{}

func (m *mockClient) TestConnection() error {
	return nil
}

func (m *mockClient) GetTorrents(ctx context.Context) ([]Torrent, error) {
	return []Torrent{
		{Hash: "123", Name: "Demo Movie 2024", Size: 4500000000, Completed: 2250000000, DownloadRate: 500000, UploadRate: 100000, State: "downloading", Progress: 50, Label: "Movies", DateAdded: 1700000000, PieceCount: 1200, PieceSize: 4194304, SavePath: "/downloads/movies"},
		{Hash: "456", Name: "Linux ISO 23.10", Size: 2100000000, Completed: 2100000000, DownloadRate: 0, UploadRate: 250000, State: "seeding", Progress: 100, Label: "OS", DateAdded: 1690000000, PieceCount: 600, PieceSize: 2097152, SavePath: "/downloads/isos"},
	}, nil
}

func (m *mockClient) GetTorrentDetails(ctx context.Context, hash string) (*Torrent, error) {
	return &Torrent{Hash: hash, Name: "Detailed Torrent", Size: 1000000000, Completed: 500000000, State: "downloading", Progress: 50}, nil
}

func (m *mockClient) GetTorrentFiles(ctx context.Context, hash string) ([]File, error) {
	return []File{
		{Name: "file1.mp4", Size: 500000000, Completed: 250000000},
		{Name: "file2.jpg", Size: 1000000, Completed: 1000000},
	}, nil
}

func (m *mockClient) DeleteTorrent(ctx context.Context, hash string) error {
	return nil
}

func (m *mockClient) AddTorrentByUrl(ctx context.Context, url string, autoStart bool, downloadPath string) error {
	log.Printf("Mock: Adding torrent from URL: %s (autoStart: %v, path: %s)", url, autoStart, downloadPath)
	return nil
}

func (m *mockClient) AddTorrentByData(ctx context.Context, data []byte, autoStart bool, downloadPath string) error {
	log.Printf("Mock: Adding torrent from data: %d bytes (autoStart: %v, path: %s)", len(data), autoStart, downloadPath)
	return nil
}

func (m *mockClient) StartTorrent(ctx context.Context, hash string) error {
	log.Printf("Mock: Starting torrent %s", hash)
	return nil
}

func (m *mockClient) PauseTorrent(ctx context.Context, hash string) error {
	log.Printf("Mock: Pausing torrent %s", hash)
	return nil
}

func (m *mockClient) StopTorrent(ctx context.Context, hash string) error {
	log.Printf("Mock: Stopping torrent %s", hash)
	return nil
}

func (m *mockClient) RecheckTorrent(ctx context.Context, hash string) error {
	log.Printf("Mock: Rechecking torrent %s", hash)
	return nil
}

func (m *mockClient) SetPriority(ctx context.Context, hash string, priority int) error {
	log.Printf("Mock: Setting priority for %s to %d", hash, priority)
	return nil
}

func (m *mockClient) SetLabel(ctx context.Context, hash string, label string) error {
	log.Printf("Mock: Setting label for %s to %s", hash, label)
	return nil
}

func (c *xmlrpcClient) call(ctx context.Context, method string, args ...Value) (*MethodResponse, error) {
	call := MethodCall{
		MethodName: method,
	}
	for _, arg := range args {
		call.Params = append(call.Params, Param{Value: arg})
	}

	body, err := xml.Marshal(call)
	if err != nil {
		return nil, err
	}

	// SCGI Header construction
	contentLength := len(body)
	headers := fmt.Sprintf("CONTENT_LENGTH\x00%d\x00SCGI\x001\x00", contentLength)
	headerLength := len(headers)
	scgiRequest := []byte(fmt.Sprintf("%d:%s,", headerLength, headers))
	scgiRequest = append(scgiRequest, body...)

	// Determine network type and address
	network := "tcp"
	address := c.addr
	if strings.HasPrefix(c.addr, "unix://") {
		network = "unix"
		address = strings.TrimPrefix(c.addr, "unix://")
	}

	d := net.Dialer{Timeout: 5 * time.Second}
	conn, err := d.DialContext(ctx, network, address)
	if err != nil {
		return nil, fmt.Errorf("dial error: %w", err)
	}
	defer conn.Close()

	if _, err := conn.Write(scgiRequest); err != nil {
		return nil, fmt.Errorf("write error: %w", err)
	}

	// Read response
	// Note: In a production environment, you'd want a more robust reader that handles large responses
	// and checks for the end of the XML-RPC message.
	var respBuf bytes.Buffer
	buf := make([]byte, 8192)
	for {
		n, err := conn.Read(buf)
		if n > 0 {
			respBuf.Write(buf[:n])
		}
		if err != nil {
			break
		}
		if strings.Contains(respBuf.String(), "</methodResponse>") {
			break
		}
	}

	// Strip HTTP/SCGI response headers if present
	fullResp := respBuf.Bytes()
	xmlIdx := bytes.Index(fullResp, []byte("<?xml"))
	if xmlIdx == -1 {
		return nil, fmt.Errorf("invalid xml response: %s", string(fullResp))
	}

	var methodResp MethodResponse
	if err := xml.Unmarshal(fullResp[xmlIdx:], &methodResp); err != nil {
		return nil, fmt.Errorf("unmarshal error: %w", err)
	}

	if methodResp.Fault != nil {
		return nil, fmt.Errorf("rpc fault: %v", methodResp.Fault.Value)
	}

	return &methodResp, nil
}

func (c *xmlrpcClient) TestConnection() error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Try to get rTorrent client version
	_, err := c.call(ctx, "system.client_version")
	if err != nil {
		return fmt.Errorf("connection test failed: %w", err)
	}
	return nil
}

func (c *xmlrpcClient) GetTorrents(ctx context.Context) ([]Torrent, error) {
	resp, err := c.call(ctx, "d.multicall2",
		Value{String: stringPtr("")},
		Value{String: stringPtr("main")},
		Value{String: stringPtr("d.hash=")},
		Value{String: stringPtr("d.name=")},
		Value{String: stringPtr("d.size_bytes=")},
		Value{String: stringPtr("d.completed_bytes=")},
		Value{String: stringPtr("d.down.rate=")},
		Value{String: stringPtr("d.up.rate=")},
		Value{String: stringPtr("d.state=")},
		Value{String: stringPtr("d.custom1=")},
		Value{String: stringPtr("d.creation_date=")},
		Value{String: stringPtr("d.size_chunks=")},
		Value{String: stringPtr("d.chunk_size=")},
		Value{String: stringPtr("d.directory=")},
		Value{String: stringPtr("d.priority=")},
	)

	if err != nil {
		return nil, err
	}

	if len(resp.Params) == 0 {
		return nil, fmt.Errorf("empty response")
	}

	rows := resp.Params[0].Value.GetArray()
	torrents := make([]Torrent, 0, len(rows))

	for _, rowValue := range rows {
		row := rowValue.GetArray()
		if len(row) < 13 {
			continue
		}

		t := Torrent{
			Hash:         row[0].GetString(),
			Name:         row[1].GetString(),
			Size:         row[2].GetLong(),
			Completed:    row[3].GetLong(),
			DownloadRate: int(row[4].GetLong()),
			UploadRate:   int(row[5].GetLong()),
			State:        c.mapState(row[6].GetLong(), row[2].GetLong(), row[3].GetLong()),
			Label:        row[7].GetString(),
			DateAdded:    row[8].GetLong(),
			PieceCount:   row[9].GetLong(),
			PieceSize:    row[10].GetLong(),
			SavePath:     row[11].GetString(),
			Priority:     int(row[12].GetLong()),
		}

		if t.Size > 0 {
			t.Progress = float64(t.Completed) / float64(t.Size) * 100
		}

		torrents = append(torrents, t)
	}

	return torrents, nil
}

func (c *xmlrpcClient) GetTorrentDetails(ctx context.Context, hash string) (*Torrent, error) {
	// For a single torrent, we use direct d.* methods instead of multicall
	// Call d.hash to verify the torrent exists
	hashResp, err := c.call(ctx, "d.hash", Value{String: stringPtr(hash)})
	if err != nil {
		return nil, fmt.Errorf("torrent not found: %w", err)
	}
	if len(hashResp.Params) == 0 {
		return nil, fmt.Errorf("torrent not found")
	}

	// Now fetch all the details we need
	name, _ := c.call(ctx, "d.name", Value{String: stringPtr(hash)})
	size, _ := c.call(ctx, "d.size_bytes", Value{String: stringPtr(hash)})
	completed, _ := c.call(ctx, "d.completed_bytes", Value{String: stringPtr(hash)})
	downRate, _ := c.call(ctx, "d.down.rate", Value{String: stringPtr(hash)})
	upRate, _ := c.call(ctx, "d.up.rate", Value{String: stringPtr(hash)})
	state, _ := c.call(ctx, "d.state", Value{String: stringPtr(hash)})
	label, _ := c.call(ctx, "d.custom1", Value{String: stringPtr(hash)})
	dateAdded, _ := c.call(ctx, "d.creation_date", Value{String: stringPtr(hash)})
	pieceCount, _ := c.call(ctx, "d.size_chunks", Value{String: stringPtr(hash)})
	pieceSize, _ := c.call(ctx, "d.chunk_size", Value{String: stringPtr(hash)})
	savePath, _ := c.call(ctx, "d.directory", Value{String: stringPtr(hash)})
	priority, _ := c.call(ctx, "d.priority", Value{String: stringPtr(hash)})

	t := &Torrent{
		Hash:         hash,
		Name:         extractString(name),
		Size:         extractLong(size),
		Completed:    extractLong(completed),
		DownloadRate: int(extractLong(downRate)),
		UploadRate:   int(extractLong(upRate)),
		State:        c.mapState(extractLong(state), extractLong(size), extractLong(completed)),
		Label:        extractString(label),
		DateAdded:    extractLong(dateAdded),
		PieceCount:   extractLong(pieceCount),
		PieceSize:    extractLong(pieceSize),
		SavePath:     extractString(savePath),
		Priority:     int(extractLong(priority)),
	}

	if t.Size > 0 {
		t.Progress = float64(t.Completed) / float64(t.Size) * 100
	}

	return t, nil
}

func extractString(resp *MethodResponse) string {
	if resp == nil || len(resp.Params) == 0 {
		return ""
	}
	return resp.Params[0].Value.GetString()
}

func extractLong(resp *MethodResponse) int64 {
	if resp == nil || len(resp.Params) == 0 {
		return 0
	}
	return resp.Params[0].Value.GetLong()
}

func (c *xmlrpcClient) GetTorrentFiles(ctx context.Context, hash string) ([]File, error) {
	// f.multicall request: hash, "", "f.path=", "f.size_bytes=", "f.completed_bytes=", "f.priority="
	resp, err := c.call(ctx, "f.multicall",
		Value{String: stringPtr(hash)},
		Value{String: stringPtr("")},
		Value{String: stringPtr("f.path=")},
		Value{String: stringPtr("f.size_bytes=")},
		Value{String: stringPtr("f.completed_bytes=")},
		Value{String: stringPtr("f.priority=")},
	)

	if err != nil {
		return nil, err
	}

	if len(resp.Params) == 0 {
		return nil, fmt.Errorf("empty response")
	}

	rows := resp.Params[0].Value.GetArray()
	files := make([]File, 0, len(rows))

	for _, rowValue := range rows {
		row := rowValue.GetArray()
		if len(row) < 4 {
			continue
		}

		files = append(files, File{
			Name:      row[0].GetString(),
			Size:      row[2].GetLong(),
			Completed: row[3].GetLong(),
			Priority:  int(row[4].GetLong()),
		})
	}

	return files, nil
}

func (c *xmlrpcClient) DeleteTorrent(ctx context.Context, hash string) error {
	_, err := c.call(ctx, "d.erase", Value{String: stringPtr(hash)})
	return err
}

func (c *xmlrpcClient) AddTorrentByUrl(ctx context.Context, url string, autoStart bool, downloadPath string) error {
	method := "load.normal"
	if autoStart {
		method = "load.start"
	}

	// Build args
	args := []Value{
		{String: stringPtr("")}, // Target (empty for default)
		{String: stringPtr(url)},
	}

	// Add directory command if specified
	if downloadPath != "" {
		args = append(args, Value{String: stringPtr(fmt.Sprintf("d.directory_base.set=\"%s\"", downloadPath))})
	}

	_, err := c.call(ctx, method, args...)
	return err
}

func (c *xmlrpcClient) AddTorrentByData(ctx context.Context, data []byte, autoStart bool, downloadPath string) error {
	method := "load.raw"
	if autoStart {
		method = "load.raw_start"
	}

	// Build args
	args := []Value{
		{String: stringPtr("")}, // Target (empty for default)
		{Base64: data},          // Torrent file data as base64
	}

	// Add directory command if specified
	if downloadPath != "" {
		args = append(args, Value{String: stringPtr(fmt.Sprintf("d.directory_base.set=\"%s\"", downloadPath))})
	}

	_, err := c.call(ctx, method, args...)
	return err
}

func (c *xmlrpcClient) StartTorrent(ctx context.Context, hash string) error {
	_, err := c.call(ctx, "d.start", Value{String: stringPtr(hash)})
	return err
}

func (c *xmlrpcClient) PauseTorrent(ctx context.Context, hash string) error {
	_, err := c.call(ctx, "d.pause", Value{String: stringPtr(hash)})
	return err
}

func (c *xmlrpcClient) StopTorrent(ctx context.Context, hash string) error {
	_, err := c.call(ctx, "d.stop", Value{String: stringPtr(hash)})
	return err
}

func (c *xmlrpcClient) RecheckTorrent(ctx context.Context, hash string) error {
	_, err := c.call(ctx, "d.check_hash", Value{String: stringPtr(hash)})
	return err
}

func (c *xmlrpcClient) SetPriority(ctx context.Context, hash string, priority int) error {
	_, err := c.call(ctx, "d.priority.set", Value{String: stringPtr(hash)}, Value{Int: intPtr(int64(priority))})
	return err
}

func (c *xmlrpcClient) SetLabel(ctx context.Context, hash string, label string) error {
	_, err := c.call(ctx, "d.custom1.set", Value{String: stringPtr(hash)}, Value{String: stringPtr(label)})
	return err
}

func (c *xmlrpcClient) mapState(isActive, size, completed int64) string {
	if isActive == 0 {
		return "paused"
	}
	if completed < size {
		return "downloading"
	}
	return "seeding"
}

func stringPtr(s string) *string { return &s }
func intPtr(i int64) *int64      { return &i }
