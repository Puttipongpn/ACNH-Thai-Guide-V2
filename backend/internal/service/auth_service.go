package service

import (
	"errors"
	"strings"
	"time"

	"acnh-thailand/backend/internal/config"
	"acnh-thailand/backend/internal/model"
	"acnh-thailand/backend/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var ErrInvalidCredentials = errors.New("invalid email or password")

type LoginResult struct {
	Token     string     `json:"token"`
	ExpiresAt time.Time  `json:"expires_at"`
	User      model.User `json:"user"`
}

type AuthService interface {
	Login(email string, password string) (*LoginResult, error)
	EnsureAdminUser(email string, password string) error
}

type authService struct {
	cfg      config.Config
	userRepo repository.UserRepository
}

func NewAuthService(cfg config.Config, userRepo repository.UserRepository) AuthService {
	return &authService{
		cfg:      cfg,
		userRepo: userRepo,
	}
}

func (s *authService) Login(email string, password string) (*LoginResult, error) {
	normalizedEmail := strings.TrimSpace(strings.ToLower(email))
	user, err := s.userRepo.FindByEmail(normalizedEmail)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	expiresAt := time.Now().Add(time.Duration(s.cfg.JWTExpiresHours) * time.Hour)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":   user.ID.String(),
		"email": user.Email,
		"role":  user.Role,
		"exp":   expiresAt.Unix(),
		"iat":   time.Now().Unix(),
	})

	signedToken, err := token.SignedString([]byte(s.cfg.JWTSecret))
	if err != nil {
		return nil, err
	}

	return &LoginResult{
		Token:     signedToken,
		ExpiresAt: expiresAt,
		User:      *user,
	}, nil
}

func (s *authService) EnsureAdminUser(email string, password string) error {
	normalizedEmail := strings.TrimSpace(strings.ToLower(email))
	exists, err := s.userRepo.ExistsByEmail(normalizedEmail)
	if err != nil {
		return err
	}
	if exists {
		return nil
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return s.userRepo.Create(&model.User{
		Email:        normalizedEmail,
		PasswordHash: string(passwordHash),
		Role:         model.UserRoleAdmin,
	})
}
