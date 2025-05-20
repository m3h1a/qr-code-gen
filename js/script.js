document.addEventListener('DOMContentLoaded', () => {
    // Get DOM Elements
    const dataInput = document.getElementById('dataInput');
    const sizeInput = document.getElementById('sizeInput');
    const fillColorInput = document.getElementById('fillColorInput');
    const backColorInput = document.getElementById('backColorInput');
    const formatSelect = document.getElementById('formatSelect');
    const generateBtn = document.getElementById('generateBtn');
    const qrcodeDisplay = document.getElementById('qrcodeDisplay');
    const downloadBtn = document.getElementById('downloadBtn');

    let qrCodeInstance = null; // To hold the QRCode instance

    // generateQRCode Function
    function generateQRCode() {
        // Clear previous QR code
        qrcodeDisplay.innerHTML = '';
        qrCodeInstance = null; // Reset instance

        // Get current values
        const data = dataInput.value.trim();
        let size = parseInt(sizeInput.value);
        const fillColor = fillColorInput.value;
        const backColor = backColorInput.value;

        // Input Validation
        if (!data) {
            alert("Data cannot be empty!");
            return;
        }
        if (isNaN(size) || size <= 0) {
            alert("Size must be a positive number! Defaulting to 256.");
            size = 256;
            sizeInput.value = size; // Update the input field
        }

        // Instantiate QRCode
        try {
            qrCodeInstance = new QRCode(qrcodeDisplay, {
                text: data,
                width: size,
                height: size,
                colorDark: fillColor,
                colorLight: backColor,
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (error) {
            console.error("Error generating QR Code:", error);
            alert("Error generating QR Code. Check console for details.");
            return;
        }


        // Make downloadBtn visible
        if (qrCodeInstance) {
            downloadBtn.style.display = 'block';
        } else {
            // Fallback for very fast generation that might not update the DOM in time for the canvas search
            // or if the library structure changes.
            // We might need to observe qrcodeDisplay for changes if this becomes an issue.
            const observer = new MutationObserver((mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        if (qrcodeDisplay.querySelector('canvas') || qrcodeDisplay.querySelector('img')) {
                            downloadBtn.style.display = 'block';
                            observer.disconnect(); // Stop observing once the QR code is detected
                            return;
                        }
                    }
                }
            });

            // Start observing qrcodeDisplay for child list changes
            observer.observe(qrcodeDisplay, { childList: true });

            // Fallback in case the QR code generation fails
            setTimeout(() => {
                if (!qrcodeDisplay.querySelector('canvas') && !qrcodeDisplay.querySelector('img')) {
                    alert("QR Code generation failed. Please try again.");
                    downloadBtn.style.display = 'none';
                    observer.disconnect(); // Ensure observer is disconnected
                }
            }, 5000); // Allow up to 5 seconds for QR code generation
        }
    }

    // downloadQRCode Function
    function downloadQRCode() {
        const format = formatSelect.value;
        const canvas = qrcodeDisplay.querySelector('canvas');

        if (!canvas) {
            // The library also generates an img tag, which could be used as a fallback
            // but toDataURL is more flexible with canvas.
            const img = qrcodeDisplay.querySelector('img');
            if (img && img.src) {
                // If canvas is not found but an image is, offer to download the image directly.
                // This might be a data URL itself or a path to a generated image.
                const link = document.createElement('a');
                link.href = img.src;
                link.download = 'qrcode.' + (img.src.includes('svg') ? 'svg' : format); // Guess format if possible
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert("Could not find QR code canvas or image. Generate QR code first.");
            }
            return;
        }

        // Convert canvas to data URL
        let dataUrl;
        try {
            if (format === 'jpeg') {
                dataUrl = canvas.toDataURL('image/jpeg');
            } else { // Default to png
                dataUrl = canvas.toDataURL('image/png');
            }
        } catch (error) {
            console.error("Error converting QR code to data URL:", error);
            alert("Error converting QR code. Try a different format or check console.");
            return;
        }


        // Create a temporary <a> element and trigger download
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'qrcode.' + format;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Event Listeners
    if (generateBtn) {
        generateBtn.addEventListener('click', generateQRCode);
    } else {
        console.error("Generate button not found");
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadQRCode);
    } else {
        console.error("Download button not found");
    }

    // Initial State
    // downloadBtn is hidden by default via inline style in HTML
    // downloadBtn.style.display = 'none';
});
