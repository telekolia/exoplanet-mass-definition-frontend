package repository

import (
	"app/internal/app/ds"
	"fmt"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func New(dsn string) (*Repository, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	return &Repository{
		db: db,
	}, nil
}

func NewRepository() (*Repository, error) {
	return &Repository{}, nil
}

func (r *Repository) GetTelescopes() ([]ds.Telescope, error) {
	var telescopes []ds.Telescope
	err := r.db.Find(&telescopes).Error
	if err != nil {
		return nil, err
	}
	if len(telescopes) == 0 {
		return nil, fmt.Errorf("массив пустой")
	}

	return telescopes, nil
}

func (r *Repository) GetTelescopeDraft() (ds.Telescope, error) {
	telescope := ds.Telescope{}
	err := r.db.Where("status = 'draft'").First(&telescope).Error
	if err != nil {
		return ds.Telescope{}, err
	}
	return telescope, nil
}

func (r *Repository) GetTelescope(id int) (ds.Telescope, error) {
	telescope := ds.Telescope{}
	err := r.db.Where("ID = ?", id).First(&telescope).Error
	if err != nil {
		return ds.Telescope{}, err
	}
	return telescope, nil
}

func (r *Repository) GetTelescopesByLatitudeRange(minLatitude, maxLatitude float64) ([]ds.Telescope, error) {
	var telescope []ds.Telescope
	err := r.db.Where("Latitude >= ? AND Latitude <= ?", minLatitude, maxLatitude).Find(&telescope).Error
	if err != nil {
		return nil, err
	}
	return telescope, nil
}
