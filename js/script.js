const DEBOUNCE_DURATION_MS = 300; // Define debounce duration

document.addEventListener('DOMContentLoaded', () => {
    // Get DOM Elements
    const dataInput = document.getElementById('dataInput');
    const sizeInput = document.getElementById('sizeInput');
    const fillColorInput = document.getElementById('fillColorInput');
    const backColorInput = document.getElementById('backColorInput');
    const formatSelect = document.getElementById('formatSelect');
    const dotStyleSelect = document.getElementById('dotStyleSelect');
    // const emojiInput = document.getElementById('emojiInput'); // Removed
    const emojiPickerButton = document.getElementById('emojiPickerButton'); // Added for emoji picker
    const selectedEmojiDisplay = document.getElementById('selectedEmojiDisplay'); // Added for emoji picker
    const emojiPicker = document.getElementById('emojiPicker'); // Added for emoji picker
    const marginInput = document.getElementById('marginInput'); // Added for QR margin
    const marginValueDisplay = document.getElementById('marginValueDisplay'); // Added for QR margin display
    const darkModeToggle = document.getElementById('darkModeToggle'); // Added for dark mode
    // const generateBtn = document.getElementById('generateBtn'); // Removed
    const qrcodeDisplay = document.getElementById('qrcodeDisplay');
    const downloadBtn = document.getElementById('downloadBtn');
    const dataInputError = document.getElementById('dataInputError'); // Added for validation messages

    let qrCodeInstance = null; // To hold the QRCodeStyling instance
    let debounceTimer = null; // For debouncing input
    let currentEmoji = null; // Added for emoji picker

    // Function to generate a data URI from an emoji
    function generateEmojiImage(emoji, size = 128) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        // Ensure font is loaded or use a commonly available one
        ctx.font = `${size * 0.8}px "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Adjust Y position slightly for better centering depending on font
        ctx.fillText(emoji, size / 2, size / 2 + size * 0.05); 
        return canvas.toDataURL('image/png');
    }

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
        const emojiValue = currentEmoji; // Use currentEmoji
        const margin = parseInt(marginInput.value); // Added for QR margin

        // Input Validation
        dataInputError.textContent = ''; // Clear previous error messages
        downloadBtn.classList.add('hidden'); // Hide download button initially

        if (!data) {
            qrcodeDisplay.innerHTML = '<p class="text-gray-500">Enter data to generate QR code.</p>';
            dataInputError.textContent = "Data cannot be empty!";
            return;
        }

        // URL Validation - Basic check for http://, https://, or www.
        if (!/^(https?:\/\/|www\.)/i.test(data)) {
            qrcodeDisplay.innerHTML = '<p class="text-gray-500">Invalid URL. QR code not generated.</p>';
            dataInputError.textContent = "Please enter a valid URL starting with http://, https://, or www.";
            return;
        }

        if (isNaN(size) || size <= 0) {
            // Keep this alert for now, or convert to similar UI error display if desired
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
                margin: margin, // Added QR Code margin
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
            // Ensure download button remains hidden on error
            downloadBtn.classList.add('hidden');
            return;
        }

        // Make downloadBtn visible only on successful generation
        downloadBtn.classList.remove('hidden');
    }

    // Debounced Generate QR Code Function
    function debouncedGenerateQRCode() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(generateQRCode, DEBOUNCE_DURATION_MS); // Use constant for debounce duration
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
    // emojiInput.addEventListener('input', debouncedGenerateQRCode); // Removed
    marginInput.addEventListener('input', () => { // Added for QR margin
        marginValueDisplay.textContent = marginInput.value;
        debouncedGenerateQRCode();
    });

    // Emoji Picker Logic
    if (emojiPickerButton && emojiPicker && selectedEmojiDisplay) {
        emojiPickerButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click from closing picker immediately if picker is outside button
            emojiPicker.classList.toggle('hidden');
        });

        emojiPicker.addEventListener('emoji-click', event => {
            currentEmoji = event.detail.unicode;
            selectedEmojiDisplay.textContent = currentEmoji;
            emojiPicker.classList.add('hidden');
            debouncedGenerateQRCode();
        });

        // Optional: Close picker if clicked outside
        document.addEventListener('click', (event) => {
            if (!emojiPicker.contains(event.target) && event.target !== emojiPickerButton && !emojiPickerButton.contains(event.target)) {
                emojiPicker.classList.add('hidden');
            }
        });
    }


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

    // Initial QR code generation on page load - only if data is present
    if (dataInput.value.trim()) {
        generateQRCode();
    } else {
        qrcodeDisplay.innerHTML = '<p class="text-gray-500">Enter data to generate QR code.</p>';
        downloadBtn.classList.add('hidden'); // Ensure download button is hidden initially
    }
    
    // Initialize margin display value
    if(marginValueDisplay && marginInput) {
        marginValueDisplay.textContent = marginInput.value;
    }

    // Preset Color Swatches Logic
    const presetSwatches = document.querySelectorAll('.preset-color-swatch');
    if (presetSwatches.length > 0 && fillColorInput && backColorInput) {
        presetSwatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                const fill = swatch.dataset.fill;
                const back = swatch.dataset.back;
                
                if (fill && back) {
                    fillColorInput.value = fill;
                    backColorInput.value = back;
                    generateQRCode(); // Regenerate QR code with new colors
                }
            });
        });
    }

    // Dark Mode Logic
    if (darkModeToggle) {
        // Check localStorage for saved preference
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.documentElement.classList.add('dark');
            darkModeToggle.checked = true;
        } else if (localStorage.getItem('darkMode') === 'disabled') {
            document.documentElement.classList.remove('dark');
            darkModeToggle.checked = false;
        }
        // else, it will follow OS preference if Tailwind is set to 'media' or default to light for 'class'

        darkModeToggle.addEventListener('change', () => {
            if (darkModeToggle.checked) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('darkMode', 'enabled');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('darkMode', 'disabled');
            }
        });
    }
});
