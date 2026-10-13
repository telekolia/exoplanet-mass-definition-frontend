package repository

import (
	"app/internal/app/ds"
	"context"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func (r *Repository) GetTelescopeLikesCount(ctx context.Context, telescopeID uint) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&ds.TelescopeLike{}).
		Where("telescope_id = ?", telescopeID).
		Count(&count).Error
	return count, err
}

func (r *Repository) GetTelescopeLikesCounts(ctx context.Context, telescopeIDs []uint) (map[uint]int64, error) {
	if len(telescopeIDs) == 0 {
		return map[uint]int64{}, nil
	}
	type row struct {
		TelescopeID uint
		Count       int64
	}

	var rows []row
	err := r.db.WithContext(ctx).Model(&ds.TelescopeLike{}).
		Select("telescope_id, COUNT(*) as count").
		Where("telescope_id IN ?", telescopeIDs).
		Group("telescope_id").
		Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	result := make(map[uint]int64, len(rows))
	for _, r := range rows {
		result[r.TelescopeID] = r.Count
	}
	return result, nil
}

func (r *Repository) IsTelescopeLiked(ctx context.Context, telescopeID, userID uint) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&ds.TelescopeLike{}).
		Where("telescope_id = ? AND user_id = ?", telescopeID, userID).Count(&count).Error
	return count > 0, err
}

func (r *Repository) SetTelescopeLike(ctx context.Context, telescopeID, userID uint, like int) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var telescope ds.Telescope
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Where("id = ? AND status = ?", telescopeID, ds.TelescopePublished).First(&telescope).Error; err != nil {
			return err
		}
		if like == 1 {
			item := ds.TelescopeLike{UserID: userID, TelescopeID: telescopeID}
			if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&item).Error; err != nil {
				return err
			}
		} else {
			if err := tx.Where("telescope_id = ? AND user_id = ?", telescopeID, userID).Delete(&ds.TelescopeLike{}).Error; err != nil {
				return err
			}
		}
		return tx.Model(&ds.TelescopeLike{}).Where("telescope_id = ?", telescopeID).Count(&count).Error
	})
	return count, err
}
