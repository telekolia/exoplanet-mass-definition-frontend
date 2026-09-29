package handler

import (
	"app/internal/app/ds"
	"app/internal/app/repository"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type Handler struct {
	Repository *repository.Repository
}

func NewHandler(r *repository.Repository) *Handler {
	return &Handler{
		Repository: r,
	}
}

func (h *Handler) RegisterHandler(router *gin.Engine) {
	router.GET("/telescope-feed", h.GetTelescopeFeed)
	router.GET("/telescope-tile", h.GetTelescopeTile)
	router.GET("/telescope-draft", h.GetTelescopeDraft)
}

func (h *Handler) RegisterStatic(router *gin.Engine) {
	router.LoadHTMLGlob("templates/*")
	router.Static("/static", "./resources")
}

func (h *Handler) errorHandler(ctx *gin.Context, errorStatusCode int, err error) {
	logrus.Error(err.Error())
	ctx.JSON(errorStatusCode, gin.H{
		"status":      "error",
		"description": err.Error(),
	})
}

func (h *Handler) GetTelescopeTile(ctx *gin.Context) {
	var telescopes []ds.Telescope
	var err error

	minLatitude := -90.0
	maxLatitude := 90.0

	if v := ctx.Query("min"); v != "" {
		if parsed, e := strconv.ParseFloat(v, 64); e == nil {
			minLatitude = parsed
		}
	}
	if v := ctx.Query("max"); v != "" {
		if parsed, e := strconv.ParseFloat(v, 64); e == nil {
			maxLatitude = parsed
		}
	}

	telescopes, err = h.Repository.GetTelescopesByLatitudeRange(minLatitude, maxLatitude)
	if err != nil {
		h.errorHandler(ctx, http.StatusInternalServerError, err)
		return
	}

	ids := make([]uint, 0, len(telescopes))
	for _, t := range telescopes {
		ids = append(ids, t.ID)
	}

	counts, err := h.Repository.GetTelescopeLikesCounts(ids)
	if err != nil {
		logrus.Error("likes counts:", err)
		counts = map[uint]int64{}
	}

	ctx.HTML(http.StatusOK, "telescope-tile.html", gin.H{
		"telescopes": telescopes,
		"min":        minLatitude,
		"max":        maxLatitude,
		"likes":      counts,
	})
}

func (h *Handler) GetTelescopeFeed(ctx *gin.Context) {
	telescopes, err := h.Repository.GetTelescopes()
	if err != nil || len(telescopes) == 0 {
		logrus.Error(err)
		ctx.String(http.StatusInternalServerError, "нет данных")
		return
	}

	currentID := 0
	if v := ctx.Query("id"); v != "" {
		if parsed, e := strconv.Atoi(v); e == nil {
			currentID = parsed
		}
	}

	var current ds.Telescope
	found := false
	for _, t := range telescopes {
		if t.ID == uint(currentID) {
			current = t
			found = true
			break
		}
	}
	if !found {
		current = telescopes[0]
	}

	nextID := 0
	minID := 0
	for i, t := range telescopes {
		if i == 0 || t.ID < uint(minID) {
			minID = int(t.ID)
		}
		if t.ID > current.ID {
			if nextID == 0 || t.ID < uint(nextID) {
				nextID = int(t.ID)
			}
		}
	}
	if nextID == 0 {
		nextID = minID
	}

	likesCount, err := h.Repository.GetTelescopeLikesCount(current.ID)
	if err != nil {
		logrus.Error("likes count:", err)
		likesCount = 0
	}

	ctx.HTML(http.StatusOK, "telescope-feed.html", gin.H{
		"telescope":  current,
		"next":       nextID,
		"likesCount": likesCount,
	})
}

func (h *Handler) GetTelescopeDraft(ctx *gin.Context) {
	telescope, err := h.Repository.GetTelescopeDraft()
	if err != nil {
		ctx.String(http.StatusNotFound, err.Error())
		return
	}

	ctx.HTML(http.StatusOK, "telescope-draft.html", gin.H{"telescope": telescope})
}
