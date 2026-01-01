build:
	docker compose build

up:
	docker compose up

down:
	docker compose down

build-up:
	docker compose up --build

logs:
	docker compose logs -f

backend-shell:
	docker compose exec backend bash

frontend-shell:
	docker compose exec frontend sh
