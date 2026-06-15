# Agnes-Image-2.0-Flash Integrationsleitfaden


## 1. Modellvorstellung


**Agnes-Image-2.0-Flash** ist ein leistungsstarkes Modell zur Bilderzeugung und Bildbearbeitung, entwickelt von **Sapiens AI**.


Das Modell unterstützt **Text-to-Image**, **Image-to-Image** und **Multi-Image Composition** Workflows. Es eignet sich für schnelle kreative Produktion, Bildoptimierung, visuelles Marketingdesign, E-Commerce-Produktbilder, Social-Media-Inhalte und professionelle visuelle Content-Erstellung.


Agnes-Image-2.0-Flash wurde im **Artificial Analysis Image Editing Leaderboard** gelistet, erreichte einen **ELO-Wert von 1.184** [dynamisch angepasst] und befindet sich im Bereich **Top 20**. Dies zeigt seine starke Bildbearbeitungsfähigkeit im Vergleich zu führenden Bildmodellen.


---


## 2. Modellübersicht


Agnes-Image-2.0-Flash ist für schnelle und hochwertige Aufgaben der Bilderzeugung und Bildbearbeitung optimiert.


Das Modell unterstützt folgende Fähigkeiten:


| Fähigkeit             | Beschreibung                                                                  |
| --------------------- | ----------------------------------------------------------------------------- |
| Text-to-Image         | Erzeugt Bilder aus Text-Prompts                                               |
| Image-to-Image        | Bearbeitet, transformiert oder verbessert vorhandene Bilder                   |
| Multi-Image Input     | Kombiniert mehrere Referenzbilder zu einem neuen Bild                         |
| Image Editing         | Ändert Komposition, Stil, Objekte, Hintergründe, Szenen und visuelle Details  |
| Style Control         | Passt Kunststil, Beleuchtung, Layout und visuelle Richtung an                 |
| Fast Generation       | Optimiert für schnelle und kosteneffiziente Produktionsworkflows              |
| OpenAI-Compatible API | Verwendet eine Request-Struktur, die mit der OpenAI Images API kompatibel ist |


---


## 3. Anwendungsfälle


| Szenario              | Beispielanwendungen                                                                     |
| --------------------- | --------------------------------------------------------------------------------------- |
| Creative Design       | Poster, Concept Art, Social-Media-Visuals                                               |
| Marketing Content     | Produktanzeigen, Kampagnen-Creatives, Banner                                            |
| Text-to-Image         | Erzeugung von Produktbildern, Illustrationen, Szenenbildern und Concept Art aus Prompts |
| Image Editing         | Objektaustausch, Hintergrundänderung, Stiltransfer, partielle Bildbearbeitung           |
| Character Composition | Kombinieren mehrerer Charaktere oder Referenzbilder in einer Szene                      |
| Visual Production     | Erstellung von Assets für Apps, Websites, Spiele und Videos                             |
| E-Commerce            | Optimierung von Produktbildern, kontextbezogene Produktszenen, Marketing-Hero-Bilder    |
| Social Content        | Memes, Avatare, Thumbnails, Lifestyle-Visuals                                           |


---


## 4. API-Informationen


### Base URL


```plain text
https://apihub.agnes-ai.com
```


### Endpoint


```plain text
POST https://apihub.agnes-ai.com/v1/images/generations
```


### Headers


```bash
-H "Authorization: Bearer YOUR_API_KEY"
-H "Content-Type: application/json"
```


---


## 5. Modellname


```plain text
agnes-image-2.0-flash
```


| Modell                | Verwendung                                                            |
| --------------------- | --------------------------------------------------------------------- |
| agnes-image-2.0-flash | Text-to-image, image-to-image, multi-image composition, image editing |


---


## 6. Request-Parameter


| Parameter                  | Typ      | Erforderlich                    | Beschreibung                                                               |
| -------------------------- | -------- | ------------------------------- | -------------------------------------------------------------------------- |
| model                      | string   | Ja                              | Modellname, festgelegt auf agnes-image-2.0-flash                           |
| prompt                     | string   | Ja                              | Text-Prompt, der das Zielbild oder die Bearbeitungsanweisung beschreibt    |
| size                       | string   | Ja                              | Ausgabegröße des Bildes, z. B. 1024x768, 1024x1024 oder 768x1024           |
| image                      | string[] | Erforderlich für image-to-image | Array der Eingabebilder. Unterstützt öffentliche URLs oder Data URI Base64 |
| return_base64              | boolean  | Nein                            | Wird verwendet, wenn text-to-image eine Base64-Ausgabe zurückgeben soll    |
| extra_body.response_format | string   | Nein                            | Ausgabeformat. Häufige Werte: url oder b64_json                            |


---


## 7. Wichtige Hinweise


### 1. Text-to-image erfordert kein `image`


Für die Text-to-Image-Erzeugung sind nur die folgenden Felder erforderlich:


```json
{
  "model": "agnes-image-2.0-flash",
  "prompt": "A clean product photo of a glass cube on a white studio background, soft shadows, high detail",
  "size": "1024x768"
}
```


---


### 2. Image-to-image erfordert `image`


Für image-to-image oder multi-image composition übergeben Sie das Array `image` auf oberster Ebene:


```json
{
  "image": [
    "https://example.com/input.png"
  ]
}
```


Für multi-image composition können mehrere Bild-URLs übergeben werden:


```json
{
  "image": [
    "https://example.com/character-1.png",
    "https://example.com/character-2.png"
  ]
}
```


---


### 3. Image-to-image erfordert keine `tags`


Im aktuellen Integrationsformat müssen image-to-image Requests Folgendes nicht übergeben:


```json
{
  "tags": ["img2img"]
}
```


Erforderlich sind nur `model`, `prompt`, `size` und `image`.


---


### 4. `response_format` nicht auf oberster Ebene platzieren


Nicht so schreiben:


```json
{
  "response_format": "url"
}
```


Empfohlenes Format:


```json
{
  "extra_body": {
    "response_format": "url"
  }
}
```


Wenn `response_format` auf oberster Ebene platziert wird, kann ein 400-Fehler auftreten.


---


## 8. Request-Beispiele


### 1. Text-to-image: URL-Ausgabe


```bash
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.0-flash",
    "prompt": "A clean product photo of a glass cube on a white studio background, soft shadows, high detail",
    "size": "1024x768",
    "extra_body": {
      "response_format": "url"
    }
  }'
```


Die URL des generierten Bildes befindet sich unter:


```plain text
data[0].url
```


---


### 2. Text-to-image: Base64-Ausgabe


```bash
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.0-flash",
    "prompt": "A clean product photo of a glass cube on a white studio background, soft shadows, high detail",
    "size": "1024x768",
    "return_base64": true
  }'
```


Die Base64-Daten des generierten Bildes befinden sich unter:


```plain text
data[0].b64_json
```


---


### 3. Image-to-image: URL-Eingabe, URL-Ausgabe


Wird verwendet, um ein vorhandenes Bild zu bearbeiten oder zu transformieren.


```bash
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.0-flash",
    "prompt": "Transform this image into a cinematic cyberpunk style while preserving the main subject and composition",
    "size": "1024x768",
    "extra_body": {
      "image": [
      "https://example.com/input-image.png"
    ],
      "response_format": "url"
    }
  }'
```


Die URL des generierten Bildes befindet sich unter:


```plain text
data[0].url
```


---


### 4. Image-to-image: URL-Eingabe, Base64-Ausgabe


```bash
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.0-flash",
    "prompt": "Make the object orange while preserving the original composition",
    "size": "1024x768",
    "extra_body": {
      "image": [
      "https://example.com/input.png"
    ],
      "response_format": "b64_json"
    }
  }'
```


Die Base64-Daten des generierten Bildes befinden sich unter:


```plain text
data[0].b64_json
```


---


### 5. Image-to-image: Data URI Base64-Eingabe


Wenn das Eingabebild keine öffentliche URL ist, kann Data URI Base64 als Eingabe verwendet werden.


Data URI Format:


```plain text
data:image/png;base64,BASE64_HERE
```


Request-Beispiel:


```bash
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.0-flash",
    "prompt": "Make the object matte black while preserving the original composition",
    "size": "1024x768",
    "extra_body": {
      "image": [
      "data:image/png;base64,BASE64_HERE"
    ],
      "response_format": "b64_json"
    }
  }'
```


---


### 6. Multi-Image Composition Request


Wird verwendet, um mehrere Eingabebilder zu einer neuen Szene zu kombinieren.


```bash
curl https://apihub.agnes-ai.com/v1/images/generations \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agnes-image-2.0-flash",
    "prompt": "Combine the two characters into an intense fantasy battle scene, dynamic lighting, detailed background, cinematic composition",
    "size": "1024x768",
    "extra_body": {
      "image": [
      "https://example.com/character-1.png",
      "https://example.com/character-2.png"
    ],
      "response_format": "url"
    }
  }'
```


---


## 9. Response-Format


### 1. URL-Ausgabe


```json
{
  "created": 1780000000,
  "data": [
    {
      "url": "https://storage.googleapis.com/agnes-aigc/xxx.png",
      "b64_json": null,
      "revised_prompt": null
    }
  ]
}
```


### 2. Base64-Ausgabe


```json
{
  "created": 1780000000,
  "data": [
    {
      "url": null,
      "b64_json": "iVBORw0KGgoAAAANSUhEUgAA...",
      "revised_prompt": null
    }
  ]
}
```


---


## 10. Response-Felder


| Feld                  | Typ           | Beschreibung                                                     |
| --------------------- | ------------- | ---------------------------------------------------------------- |
| created               | integer       | Zeitstempel der Request-Erstellung                               |
| data                  | array         | Liste der generierten Bildergebnisse                             |
| data[].url            | string / null | URL des generierten Bildes. Bei Base64-Ausgabe in der Regel null |
| data[].b64_json       | string / null | Base64-Bilddaten. Bei URL-Ausgabe in der Regel null              |
| data[].revised_prompt | string / null | Überarbeiteter Prompt, falls vorhanden. Andernfalls null         |


---


## 11. Preise


| Typ              | Originalpreis  | Aktueller Preis |
| ---------------- | -------------- | --------------- |
| Generated Images | $0.003 / image | $0 / image      |


---


## 12. Funktionen und Kompatibilität


Agnes-Image-2.0-Flash unterstützt folgende Funktionen:

- Text-to-image-Erzeugung
- Image-to-image-Bearbeitung
- Multi-image input und image composition
- Prompt-basierte Bildtransformation
- Stabile Stil- und Kompositionssteuerung
- Bildeingabe über öffentliche URL
- Bildeingabe über Data URI Base64
- URL- oder Base64-Ausgabe
- Schnelle Generierung für Produktionsworkflows
- Request-Struktur kompatibel mit OpenAI Images API

---


## 13. Best Practices


### 1. Text-to-image Prompting


Für eine bessere Generierungsqualität sollten klare visuelle Anweisungen im Prompt enthalten sein, darunter Motiv, Szene, Stil, Beleuchtung, Komposition und Qualitätsanforderungen.


Beispiel:


```plain text
A professional product photo of a wireless headphone on a clean white background, soft studio lighting, sharp details, commercial photography style
```


---


### 2. Image Editing Prompting


Bei Bearbeitungsaufgaben sollte klar beschrieben werden, was geändert werden soll und was unverändert bleiben soll.


Beispiel:


```plain text
Change the background to a futuristic city at night while keeping the person’s face, outfit, and pose unchanged
```


---


### 3. Multi-image Composition Prompting


Bei Aufgaben mit mehreren Bildern sollte die Beziehung zwischen den verschiedenen Eingabebildern beschrieben werden.


Beispiel:


```plain text
Place the person from the first image beside the robot from the second image in a cinematic sci-fi battle scene
```


---


## 14. Empfohlene Prompt-Struktur


### Text-to-image Prompt-Struktur


```plain text
[Main subject] + [Scene / background] + [Style] + [Lighting] + [Composition] + [Quality requirements]
```


Beispiel:


```plain text
A young explorer standing in an ancient temple, cinematic fantasy style, warm dramatic lighting, wide-angle composition, ultra detailed, high quality
```


### Image-to-image Prompt-Struktur


```plain text
[Editing instruction] + [Elements to preserve] + [Target style / scene] + [Lighting] + [Composition] + [Quality requirements]
```


Beispiel:


```plain text
Change the background into a cinematic fantasy temple while preserving the person’s face, outfit, and pose, warm dramatic lighting, wide-angle composition, ultra detailed, high quality
```


---


## 15. FAQ


### 1. Unterstützt Agnes-Image-2.0-Flash text-to-image?


Ja.


Text-to-image Requests erfordern kein `image`. Benötigt werden nur `model`, `prompt` und `size`.


---


### 2. Unterstützt Agnes-Image-2.0-Flash image-to-image?


Ja.


Image-to-image Requests erfordern ein `image` Array auf oberster Ebene.


---


### 3. Erfordert image-to-image `tags: ["img2img"]`?


Nein.


Aktuelle image-to-image Requests erfordern nur `model`, `prompt`, `size` und `image`.


---


### 4. Warum verursacht `response_format` auf oberster Ebene einen Fehler?


In der aktuellen API-Struktur sollte `response_format` nicht auf oberster Ebene platziert werden.


Empfohlenes Format:


```json
{
  "extra_body": {
    "response_format": "url"
  }
}
```


---


### 5. Was tun, wenn die Eingabebild-URL nicht erreichbar ist?


Wenn der Server nicht auf die Eingabebild-URL zugreifen kann, kann der Request fehlschlagen.


Empfohlene Optionen:

- Eine öffentlich zugängliche HTTPS-Bild-URL verwenden
- Data URI Base64 als Eingabe verwenden

---


### 6. Was tun, wenn der Request abläuft?


Die Bilderzeugung kann einige Sekunden bis mehrere zehn Sekunden dauern.


Es wird empfohlen, ein längeres Client-Timeout festzulegen, z. B.:


```plain text
60s - 360s
```


---


## 16. Integrations-Checkliste


Vor der Integration prüfen:

- Sie verfügen über einen gültigen API Key
- Die Request-URL lautet `https://apihub.agnes-ai.com/v1/images/generations`
- Der Header `Authorization: Bearer YOUR_API_KEY` ist enthalten
- Der Header `Content-Type: application/json` ist enthalten
- Der Modellname lautet `agnes-image-2.0-flash`
- Text-to-image Requests enthalten kein `image`
- Image-to-image Requests enthalten ein `image` Array auf oberster Ebene
- Image-to-image Requests erfordern kein `tags: ["img2img"]`
- `response_format` befindet sich innerhalb von `extra_body`
- Eingabebild-URLs sind öffentlich zugänglich oder Data URI Base64 wird verwendet
- Das Client-Timeout sollte zwischen 60s und 360s eingestellt werden