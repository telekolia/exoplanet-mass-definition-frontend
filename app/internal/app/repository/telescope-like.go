package repository

import "app/internal/app/ds"

func (r *Repository) GetTelescopeLikesCount(telescopeID uint) (int64, error) {
	var count int64
	err := r.db.Model(&ds.TelescopeLike{}).
		Where("telescope_id = ?", telescopeID).
		Count(&count).Error
	return count, err
}

func (r *Repository) GetTelescopeLikesCounts(telescopeIDs []uint) (map[uint]int64, error) {
	type row struct {
		TelescopeID uint
		Count       int64
	}

	var rows []row
	err := r.db.Model(&ds.TelescopeLike{}).
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
