package ds

type TelescopeLike struct {
	ID          uint `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID      uint `gorm:"not null;uniqueIndex:idx_user_composer" json:"user_id"`
	TelescopeID uint `gorm:"not null;uniqueIndex:idx_user_composer" json:"telescope_id"`

	User      User      `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"user"`
	Telescope Telescope `gorm:"foreignKey:TelescopeID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT;" json:"telescope"`
}
