# OTP Frontend

Instrukcja opisuje, jak uruchomić frontend (Node.js/Next.js) oraz lokalną instancję OpenTripPlanner (OTP) z wymaganymi konfiguracjami.

## Uruchomienie aplikacji Node.js

1. **Zainstaluj zależności** – projekt wymaga Node.js w wersji co najmniej 18.17.
	 ```bash
	 npm install
	 ```
2. **Skonfiguruj zmienne środowiskowe** – jeśli korzystasz z pliku `.env.local`, uzupełnij potrzebne klucze (np. adres OTP, klucze mapowe).
3. **Uruchom serwer deweloperski**:
	 ```bash
	 npm run dev
	 ```
4. **Wejdź na stronę** – aplikacja domyślnie działa pod adresem [https://otp.lan:3000](https://otp.lan:3000). Upewnij się, że domena `otp.lan` wskazuje na `127.0.0.1` i że posiadasz lokalny certyfikat HTTPS.

> 💡 Jeśli preferujesz innego menedżera pakietów (pnpm, yarn, bun), użyj odpowiednich poleceń.

## Przygotowanie lokalnego HTTPS i domeny

1. Dodaj wpis do `/etc/hosts`:
	 ```
	 127.0.0.1    otp.lan
	 ```
2. Wygeneruj lokalny certyfikat dla `otp.lan` (np. za pomocą [mkcert](https://github.com/FiloSottile/mkcert)) i skonfiguruj serwer tak, aby wymuszał HTTPS w środowisku deweloperskim.
3. Upewnij się, że frontend i OTP korzystają z tego samego certyfikatu/domeny, aby uniknąć problemów CORS.

## Uruchomienie OpenTripPlanner

### 1. Klonowanie i build OTP

```bash
git clone https://github.com/opentripplanner/OpenTripPlanner.git ~/Documents/OpenTripPlanner
cd ~/Documents/OpenTripPlanner
./mvnw -DskipTests package
```

Po zbudowaniu artefakt znajdziesz w `~/Documents/OpenTripPlanner/otp-shaded/target/`.

### 2. Przygotowanie katalogu z danymi

Utwórz katalog na dane oraz konfiguracje (np. `~/Documents/OpenTripPlanner/uploaded-data`). Wewnątrz umieść dwa pliki:

- `router-config.json`:
	```json
	{
		"updaters": [
			{
				"type": "stop-time-updater",
				"feedId": "MAL",
				"url": "https://otp.lan/api/v1/raw-trip-updates/RawTripUpdates.pb",
				"frequency": "20s"
			},
			{
				"type": "real-time-alerts",
				"feedId": "MAL",
				"url": "https://otp.lan/api/v1/raw-service-alerts/RawServiceAlerts.pb",
				"frequency": "20s"
			},
			{
				"type": "vehicle-positions",
				"feedId": "MAL",
				"url": "https://otp.lan/api/v1/raw-vehicle-positions/RawVehiclePositions.pb",
				"frequency": "20s"
			}
		]
	}
	```

- `build-config.json`:
	```json
	{
		"osmDefaults": {
			"osmTagMapping": "DEFAULT"
		},
		"osmNaming": "DEFAULT",
		"transitFeeds": [
			{
				"type": "gtfs",
				"feedId": "MAL",
				"source": "https://otp.lan/api/v1/raw-static/GTFS.zip"
			}
		]
	}
	```

Zapewnij, że `https://otp.lan/...` jest dostępne przez lokalny HTTPS (np. reverse proxy lub mock serwer).

### 3. Uruchomienie OTP

```bash
java -Xmx4G -jar /home/jakub/Documents/OpenTripPlanner/otp-shaded/target/otp-shaded-2.8.0-SNAPSHOT.jar ~/Documents/OpenTripPlanner/uploaded-data --build --serve
```

Polecenie jednocześnie zbuduje graf i wystartuje serwer z plikami w katalogu `uploaded-data`.

### 4. Walidacja

- Otwórz [https://otp.lan:8080](https://otp.lan:8080) (lub port wskazany w logach OTP), aby potwierdzić, że serwer działa.
- Sprawdź logi, czy feed `MAL` został poprawnie wczytany i aktualizacje w czasie rzeczywistym są pobierane co 20 sekund.

Po uruchomieniu OTP i frontendu Twoje środowisko deweloperskie będzie korzystać z jednej lokalnej domeny `otp.lan` oraz HTTPS, co zapewnia spójność i bezpieczeństwo komunikacji.
