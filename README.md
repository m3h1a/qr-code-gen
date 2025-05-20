# QR Code Generator

This is a simple client-side QR Code Generator built with HTML, CSS, and JavaScript. It allows you to generate QR codes for URLs or any text data, customize their appearance (size, colors), and download them as PNG or JPEG images.

## Features

*   Generate QR codes from text or URLs.
*   Customize QR code size.
*   Customize fill (foreground) and background colors.
*   Download QR codes in PNG or JPEG format.
*   Entirely client-side, no server needed.

## How to Use

1.  **Open the Application**:
    *   Clone or download this repository.
    *   Open the `index.html` file in your web browser.

2.  **Generate QR Code**:
    *   **Data (URL/Text)**: Enter the text or URL you want to encode in the QR code.
    *   **Size (pixels)**: Specify the desired width and height of the QR code image (e.g., 256).
    *   **Fill Color**: Choose the color for the QR code modules (the dark parts).
    *   **Background Color**: Choose the color for the QR code background (the light parts).
    *   **Image Format**: Select either PNG or JPEG for the download format.
    *   Click the "**Generate QR Code**" button.

3.  **Preview**:
    *   The generated QR code will appear in the display area below the generate button.

4.  **Download QR Code**:
    *   Once the QR code is generated, the "**Download QR Code**" button will become visible.
    *   Click it to download the QR code image in your selected format.

## Libraries Used

*   [qrcode.js](https://github.com/davidshimjs/qrcodejs): A JavaScript library for making QR Codes. (Included via CDN)

## Project Structure

```
.
├── css/
│   └── style.css       # Styles for the application
├── js/
│   └── script.js       # JavaScript logic
├── index.html          # Main HTML file
└── README.md           # This file
```

Feel free to modify or extend this application!
