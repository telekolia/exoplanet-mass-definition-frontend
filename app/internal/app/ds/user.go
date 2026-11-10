package ds

type User struct {
	ID          uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Login       string `gorm:"type:varchar(64);unique;not null" json:"login"`
	Password    string `gorm:"type:varchar(64);not null" json:"-"`
	IsModerator bool   `gorm:"type:boolean;default:false" json:"is_moderator"`
}
