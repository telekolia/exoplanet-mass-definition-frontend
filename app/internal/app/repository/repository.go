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
	InStock          bool
	Likes            []int
}

func (t Telescope) LikesCount() int {
	return len(t.Likes)
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
			InStock:          false,
			Likes:            []int{3, 5},
		},
		{
			ID:               5,
			Title:            "NexStar 4SE Computerized Telescope",
			Description:      "4-дюймовый Максутов-Кассегрен с GoTo. Компактный и удобный для наблюдений Луны и планет.",
			MeasurementCost:  1000,
			MaxMagnification: 236,
			ImageURL:         "/static/telescope.png",
			InStock:          true,
			Likes:            []int{1, 4, 6, 12, 14, 15, 16, 17, 18, 19, 20, 21},
		},
		{
			ID:               6,
			Title:            "Advanced VX 8\" Schmidt-Cassegrain",
			Description:      "8-дюймовый SCT на экваториальной монтировке Advanced VX. Подходит для астрофотографии.",
			MeasurementCost:  3200,
			MaxMagnification: 480,
			ImageURL:         "/static/telescope.png",
			InStock:          true,
			Likes:            []int{2, 3, 4, 5, 6, 7, 8, 9, 10},
		},
		{
			ID:               7,
			Title:            "Astro Fi 102mm Maksutov-Cassegrain",
			Description:      "102-мм Максутов-Кассегрен с управлением со смартфона через Wi-Fi. Компактный, идеален для начинающих.",
			MeasurementCost:  800,
			MaxMagnification: 241,
			ImageURL:         "/static/telescope.png",
			InStock:          false,
			Likes:            []int{11, 22, 23},
		},
		{
			ID:               8,
			Title:            "PowerSeeker 127EQ Newtonian",
			Description:      "127-мм рефлектор Ньютона на экваториальной монтировке. Отличный старт для знакомства с небом.",
			MeasurementCost:  600,
			MaxMagnification: 300,
			ImageURL:         "/static/telescope.png",
			InStock:          true,
			Likes:            []int{1, 2, 3},
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
