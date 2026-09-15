package repository

import (
	"fmt"
)

type Repository struct {
}

func NewRepository() (*Repository, error) {
	return &Repository{}, nil
}

type Telescope struct {
	ID               int
	Title            string
	Description      string
	MeasurementCost  int
	MaxMagnification int
	ImageURL         string
	VideoURL         string
	InStock          bool
	Likes            []int
}

func (t Telescope) LikesCount() int {
	return len(t.Likes)
}

func (t Telescope) ShortDescription() string {
	const limit = 100
	// Работаем по рунам, чтобы не разрезать многобайтовые символы
	runes := []rune(t.Description)
	if len(runes) <= limit {
		return t.Description
	}
	return string(runes[:limit]) + "..."
}

func (r *Repository) GetTelescopes() ([]Telescope, error) {
	telescopes := []Telescope{
		{
			ID:               1,
			Title:            "NexStar 8SE Computerized Telescope",
			Description:      "Классический 8-дюймовый Шмидт-Кассегрен с GoTo. 40 000+ объектов в базе, SkyAlign, полностью автоматизированное монтирование.",
			MeasurementCost:  2000,
			MaxMagnification: 480,
			ImageURL:         "/static/telescope.png",
			VideoURL:         "/static/lenta.mp4",
			InStock:          true,
			Likes:            []int{1, 2, 3, 5, 8, 13},
		},
		{
			ID:               2,
			Title:            "NexStar Evolution 8 Telescope",
			Description:      "Компактная 8-дюймовая Шмидт-Кассегрен с StarBright XLT и Fastar. LiFePO4 аккумулятор на 10 часов, USB-порт.",
			MeasurementCost:  2399,
			MaxMagnification: 480,
			ImageURL:         "/static/telescope.png",
			VideoURL:         "/static/lenta.mp4",
			InStock:          true,
			Likes:            []int{4, 7, 9, 11},
		},
		{
			ID:               3,
			Title:            "NexStar 6SE Computerized Telescope",
			Description:      "6-дюймовый Шмидт-Кассегрен с GoTo. Идеален для начинающих: лёгкий, компактный, с базой на 40 000 объектов.",
			MeasurementCost:  1500,
			MaxMagnification: 354,
			ImageURL:         "/static/telescope.png",
			VideoURL:         "/static/lenta.mp4",
			InStock:          true,
			Likes:            []int{2, 6, 10},
		},
		{
			ID:               4,
			Title:            "NexStar 5SE Computerized Telescope",
			Description:      "5-дюймовый Шмидт-Кассегрен с GoTo. Отличный выбор для города и выездов на природу.",
			MeasurementCost:  1200,
			MaxMagnification: 295,
			ImageURL:         "/static/telescope.png",
			VideoURL:         "/static/lenta.mp4",
			InStock:          false,
			Likes:            []int{3, 5},
		},
	}

	if len(telescopes) == 0 {
		return nil, fmt.Errorf("массив пустой")
	}

	return telescopes, nil
}

func (r *Repository) GetTelescope(id int) (Telescope, error) {
	telescopes, err := r.GetTelescopes()
	if err != nil {
		return Telescope{}, err
	}

	for _, t := range telescopes {
		if t.ID == id {
			return t, nil
		}
	}
	return Telescope{}, fmt.Errorf("телескоп не найден")
}

func (r *Repository) GetTelescopesByCostRange(minCost, maxCost int) ([]Telescope, error) {
	telescopes, err := r.GetTelescopes()
	if err != nil {
		return []Telescope{}, err
	}

	var result []Telescope
	for _, t := range telescopes {
		if t.MeasurementCost >= minCost && t.MeasurementCost <= maxCost {
			result = append(result, t)
		}
	}

	return result, nil
}
