package ds

type Telescope struct {
	ID          int
	Status      string
	Title       string
	Description string
	Latitude    float64
	Longitude   float64
	ImageURL    string
	VideoURL    string
	Likes       []int
}
