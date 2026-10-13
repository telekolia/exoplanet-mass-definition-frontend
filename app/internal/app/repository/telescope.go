package repository

import (
	"app/internal/app/ds"
	"errors"
	"fmt"
	"time"

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

func (r *Repository) GetTelescopeFeedItem(currentID int, next bool) (ds.Telescope, error) {
	var telescope ds.Telescope

	if currentID == 0 {
		err := r.db.Where("status = ?", "published").Order("id asc").Limit(1).First(&telescope).Error
		return telescope, err
	}

	if next {
		err := r.db.Where("status = ? AND id > ?", "published", currentID).Order("id asc").Limit(1).First(&telescope).Error
		if err != nil {
			err = r.db.Where("status = ?", "published").Order("id asc").Limit(1).First(&telescope).Error
		}
		return telescope, err
	}

	err := r.db.Where("status = ? AND id = ?", "published", currentID).First(&telescope).Error
	return telescope, err
}

func (r *Repository) GetTelescopesByLatitudeRange(minLatitude, maxLatitude float64) ([]ds.Telescope, error) {
	var telescope []ds.Telescope
	err := r.db.Where("Latitude >= ? AND Latitude <= ? AND Status = ?", minLatitude, maxLatitude, "published").Find(&telescope).Error
	if err != nil {
		return nil, err
	}
	return telescope, nil
}

func (r *Repository) CreateDraftTelescope(userID uint, title string) (ds.Telescope, error) {
	var existing ds.Telescope
	err := r.db.Where("creator_id = ? AND status = ?", userID, "draft").First(&existing).Error
	if err == nil {
		return existing, nil
	}

	newTelescope := ds.Telescope{
		Title:        title,
		Status:       "draft",
		CreatorID:    userID,
		CreationTime: time.Now(),
		FormingTime:  time.Now(),
	}

	if err := r.db.Create(&newTelescope).Error; err != nil {
		return ds.Telescope{}, err
	}
	return newTelescope, nil
}

func (r *Repository) PublishTelescope(id uint, description string, latitude, longitude float64) error {
	res := r.db.Model(&ds.Telescope{}).
		Where("id = ? AND status = ?", id, "draft").
		Updates(map[string]interface{}{
			"description":  description,
			"latitude":     latitude,
			"longitude":    longitude,
			"status":       "published",
			"forming_time": time.Now(),
		})
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return errors.New("черновик не найден")
	}
	return nil
}

func (r *Repository) DeleteTelescope(id int) error {
	query := "UPDATE telescopes SET status = 'deleted', forming_time = NOW() WHERE id = $1 AND status != 'deleted'"
	res := r.db.Exec(query, id)
	if res.Error != nil {
		return res.Error
	}
	if res.RowsAffected == 0 {
		return errors.New("карточка не найдена или уже удалена")
	}
	return nil
}
