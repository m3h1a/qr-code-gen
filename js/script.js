document.addEventListener('DOMContentLoaded', () => {
    // Get DOM Elements
    const dataInput = document.getElementById('dataInput');
    const sizeInput = document.getElementById('sizeInput');
    const fillColorInput = document.getElementById('fillColorInput');
    const backColorInput = document.getElementById('backColorInput');
    const formatSelect = document.getElementById('formatSelect');
    const dotStyleSelect = document.getElementById('dotStyleSelect');
    const emojiInput = document.getElementById('emojiInput');
    // const generateBtn = document.getElementById('generateBtn'); // Removed
    const qrcodeDisplay = document.getElementById('qrcodeDisplay');
    const downloadBtn = document.getElementById('downloadBtn');

    let qrCodeInstance = null; // To hold the QRCodeStyling instance
    let debounceTimer = null; // For debouncing input

    // generateQRCode Function
    function generateQRCode() {
        // Clear previous QR code
        qrcodeDisplay.innerHTML = '';

        // Get current values
        const data = dataInput.value.trim();
        let size = parseInt(sizeInput.value);
        const fillColor = fillColorInput.value;
        const backColor = backColorInput.value;
        const dotStyle = dotStyleSelect.value;
        const emojiValue = emojiInput.value.trim(); // Added

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

        // Generate emoji image data URI if emojiValue is present
        let emojiImage = emojiValue ? generateEmojiImage(emojiValue) : null;

        // Instantiate QRCodeStyling
        try {
            const options = {
                width: size,
                height: size,
                type: 'canvas',
                data: data,
                dotsOptions: {
                    color: fillColor,
                    type: dotStyle
                },
                backgroundOptions: {
                    color: backColor
                },
                qrOptions: {
                    errorCorrectionLevel: 'H'
                }
            };

            if (emojiImage) {
                options.image = emojiImage;
                options.imageOptions = {
                    hideBackgroundDots: true,
                    imageSize: 0.4,
                    margin: 4
                };
            }

            qrCodeInstance = new QRCodeStyling(options);
            qrCodeInstance.append(qrcodeDisplay);
        } catch (error) {
            console.error("Error generating QR Code:", error);
            alert("Error generating QR Code. Check console for details.");
            return;
        }

        // Make downloadBtn visible
        if (qrCodeInstance) {
            downloadBtn.classList.remove('hidden');
        } else {
            // Fallback for very fast generation that might not update the DOM in time for the canvas search
            // or if the library structure changes.
            // We might need to observe qrcodeDisplay for changes if this becomes an issue.
            const observer = new MutationObserver((mutationsList, observer) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        if (qrcodeDisplay.querySelector('canvas') || qrcodeDisplay.querySelector('img') || qrcodeDisplay.querySelector('svg')) {
                            downloadBtn.classList.remove('hidden');
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
                if (!qrcodeDisplay.querySelector('canvas') && !qrcodeDisplay.querySelector('img') && !qrcodeDisplay.querySelector('svg')) {
                    alert("QR Code generation failed. Please try again.");
                    downloadBtn.classList.add('hidden');
                    observer.disconnect(); // Ensure observer is disconnected
                }
            }, 5000); // Allow up to 5 seconds for QR code generation
        }
    }

    // Debounced Generate QR Code Function
    function debouncedGenerateQRCode() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(generateQRCode, 300); // 300ms debounce
    }

    // downloadQRCode Function
    function downloadQRCode() {
        if (!qrCodeInstance) {
            alert("Please generate a QR code first.");
            return;
        }
        const format = formatSelect.value;
        
        // Use the download method from qr-code-styling
        try {
            qrCodeInstance.download({
                name: 'qrcode',
                extension: format
            });
        } catch (error) {
            console.error("Error downloading QR Code:", error);
            alert("Error downloading QR Code. Check console for details.");
        }
    }

    // Event Listeners for real-time updates
    dataInput.addEventListener('input', debouncedGenerateQRCode);
    sizeInput.addEventListener('input', debouncedGenerateQRCode);
    fillColorInput.addEventListener('input', generateQRCode); // Color pickers usually update on change/blur, direct call is fine
    backColorInput.addEventListener('input', generateQRCode); // Color pickers usually update on change/blur, direct call is fine
    dotStyleSelect.addEventListener('change', generateQRCode);
    emojiInput.addEventListener('input', debouncedGenerateQRCode);

    // Remove generateBtn event listener as it will be removed from HTML
    // if (generateBtn) {
    //     generateBtn.addEventListener('click', generateQRCode);
    // } else {
    //     console.error("Generate button not found or already removed");
    // }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadQRCode);
    } else {
        console.error("Download button not found");
    }

    // Initial QR code generation on page load
    generateQRCode(); 
});
