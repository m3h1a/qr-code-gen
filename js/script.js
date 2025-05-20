const DEBUG = false; // Debug flag for development logging
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
    const sunIcon = document.getElementById('sunIcon'); // Added for dark mode icon
    const moonIcon = document.getElementById('moonIcon'); // Added for dark mode icon
    // Removed topTextInput, bottomTextInput, paddingInput, and paddingValueDisplay
    const qrcodeDisplay = document.getElementById('qrcodeDisplay');
    const downloadBtn = document.getElementById('downloadBtn');
    const dataInputError = document.getElementById('dataInputError'); // Added for validation messages

    let qrCodeInstance = null; // To hold the QRCodeStyling instance
    let debounceTimer = null; // For debouncing input
    let currentEmoji = null; // Added for emoji picker
    // Removed finalOutputCanvas and isCompositeImage variables

    // Function to generate a data URI from an emoji
    function generateEmojiImage(emoji, size = 128) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        // Clear the canvas with a transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        // Removed topText, bottomText, and overallPadding variables

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
            alert("Size must be a positive number! Defaulting to 256.");
            size = 256;
            sizeInput.value = size; // Update the input field
        }

        // Adjust size based on container width
        const availableWidth = qrcodeDisplay.clientWidth > 0 ? qrcodeDisplay.clientWidth : 256;
        let finalSize = size;

        if (size > availableWidth) {
            finalSize = availableWidth;
        }
        
        if (finalSize <= 0) {
            finalSize = 256;
        }

        // Generate emoji image data URI if emojiValue is present
        let emojiImage = emojiValue ? generateEmojiImage(emojiValue, Math.floor(finalSize * 0.3)) : null;

        // Instantiate QRCodeStyling
        try {
            const options = {
                width: finalSize,
                height: finalSize,
                type: 'canvas',
                data: data,
                margin: margin,
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
                    margin: Math.max(4, Math.floor(finalSize * 0.02))
                };
            }

            qrCodeInstance = new QRCodeStyling(options);
            if (DEBUG) {
                console.log("[Debug] QRCodeStyling instance created with options:", options);
            }

            // Clear previous display first
            qrcodeDisplay.innerHTML = ''; 
            downloadBtn.classList.add('hidden');

            // Simple append without composite image
            qrCodeInstance.append(qrcodeDisplay);
            downloadBtn.classList.remove('hidden');

        } catch (error) {
            console.error("Error generating QR Code:", error);
            alert("Error generating QR Code. Check console for details.");
            downloadBtn.classList.add('hidden');
        }
    }

    // Debounced Generate QR Code Function
    function debouncedGenerateQRCode() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(generateQRCode, DEBOUNCE_DURATION_MS); // Use constant for debounce duration
    }

    // downloadQRCode Function
    function downloadQRCode() {
        const format = formatSelect.value;

        if (!qrCodeInstance) {
            alert("Please generate a QR code first.");
            return;
        }
        
        // Simple download using the library
        qrCodeInstance.download({
            name: 'qrcode',
            extension: format
        }).catch(e => console.error("Error during library download:", e));
    }

    // Event Listeners for real-time updates
    dataInput.addEventListener('input', debouncedGenerateQRCode);
    sizeInput.addEventListener('input', debouncedGenerateQRCode);
    fillColorInput.addEventListener('input', generateQRCode);
    backColorInput.addEventListener('input', generateQRCode);
    dotStyleSelect.addEventListener('change', generateQRCode);
    marginInput.addEventListener('input', () => {
        marginValueDisplay.textContent = marginInput.value;
        debouncedGenerateQRCode();
    });
    
    // Removed event listeners for topTextInput, bottomTextInput, and paddingInput

    // Emoji Picker Logic
    if (emojiPickerButton && emojiPicker && selectedEmojiDisplay) {
        const positionEmojiPicker = () => {
            // Picker is assumed to be visible (no 'hidden' class) when this is called for measurement
            const pickerRect = emojiPicker.getBoundingClientRect();
            let pickerHeight = pickerRect.height;

            // Fallback if height is still 0 (e.g. component not fully rendered, though unlikely)
            if (pickerHeight === 0) {
                console.warn("Emoji picker height is 0 even after removing 'hidden' class. Using fallback height 360px.");
                pickerHeight = 360; // Fallback height
            }

            const buttonRect = emojiPickerButton.getBoundingClientRect();
            const spaceBelow = window.innerHeight - buttonRect.bottom;
            const spaceAbove = buttonRect.top;

            // Reset positioning classes. 'right-0' is set in HTML for horizontal alignment.
            emojiPicker.classList.remove('top-full', 'bottom-full', 'mt-1', 'mb-1');

            if (spaceBelow < pickerHeight && spaceAbove > pickerHeight && spaceBelow < spaceAbove) {
                // Not enough space below, AND enough space above, AND more space above than below
                emojiPicker.classList.add('bottom-full', 'mb-1'); // Position above button
            } else {
                // Default: position below button
                emojiPicker.classList.add('top-full', 'mt-1');
            }
        };

        emojiPickerButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click from closing picker immediately via document listener

            const isHidden = emojiPicker.classList.contains('hidden');

            if (isHidden) {
                // Remove 'hidden' to allow visibility and measurement, then position
                emojiPicker.classList.remove('hidden');
                positionEmojiPicker(); 
                // Picker is now visible and positioned
            } else {
                // Just hide it
                emojiPicker.classList.add('hidden');
            }
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
    if (darkModeToggle && sunIcon && moonIcon) {
        // Function to update icon visibility
        const updateIconVisibility = () => {
            if (document.documentElement.classList.contains('dark')) {
                sunIcon.classList.add('hidden');
                moonIcon.classList.remove('hidden');
            } else {
                sunIcon.classList.remove('hidden');
                moonIcon.classList.add('hidden');
            }
        };

        // Function to set dark mode
        const setDarkMode = (enabled) => {
            if (enabled) {
                document.documentElement.classList.add('dark');
                darkModeToggle.checked = true;
                localStorage.setItem('darkMode', 'enabled');
            } else {
                document.documentElement.classList.remove('dark');
                darkModeToggle.checked = false;
                localStorage.setItem('darkMode', 'disabled');
            }
            updateIconVisibility();
        };

        // Initialize theme based on saved preference or system preference
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme === 'enabled') {
            setDarkMode(true);
        } else if (savedTheme === 'disabled') {
            setDarkMode(false);
        } else {
            // No saved preference, use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setDarkMode(prefersDark);
        }

        // Toggle theme on switch change
        darkModeToggle.addEventListener('change', () => {
            setDarkMode(darkModeToggle.checked);
        });

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            // Only apply system preference if user hasn't set a preference
            if (!localStorage.getItem('darkMode')) {
                setDarkMode(e.matches);
            }
        });
    }
});
