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
    const topTextInput = document.getElementById('topTextInput'); // Added for top text
    const bottomTextInput = document.getElementById('bottomTextInput'); // Added for bottom text
    const paddingInput = document.getElementById('paddingInput'); // Added for overall padding
    const paddingValueDisplay = document.getElementById('paddingValueDisplay'); // Added for padding display
    // const generateBtn = document.getElementById('generateBtn'); // Removed
    const qrcodeDisplay = document.getElementById('qrcodeDisplay');
    const downloadBtn = document.getElementById('downloadBtn');
    const dataInputError = document.getElementById('dataInputError'); // Added for validation messages

    let qrCodeInstance = null; // To hold the QRCodeStyling instance
    let debounceTimer = null; // For debouncing input
    let currentEmoji = null; // Added for emoji picker
    let finalOutputCanvas = null; // For composite image with text/padding
    let isCompositeImage = false; // Flag for composite image

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
        const topText = topTextInput.value.trim(); // Added for top text
        const bottomText = bottomTextInput.value.trim(); // Added for bottom text
        const overallPadding = parseInt(paddingInput.value); // Added for overall padding

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

        // Adjust size based on container width
        const availableWidth = qrcodeDisplay.clientWidth > 0 ? qrcodeDisplay.clientWidth : 256; // Fallback if clientWidth is 0
        let finalSize = size;

        if (size > availableWidth) {
            finalSize = availableWidth;
            // Optional: Could update sizeInput.value here or notify user, for now, just cap.
            // console.log(`Requested size ${size}px was too large for container, adjusted to ${finalSize}px`);
        }
        
        // Ensure finalSize is not zero or negative if availableWidth was an issue.
        if (finalSize <= 0) {
            finalSize = 256; // Default fallback size
        }


        // Generate emoji image data URI if emojiValue is present
        let emojiImage = emojiValue ? generateEmojiImage(emojiValue, Math.floor(finalSize * 0.3)) : null; // Adjust emoji size relative to finalSize


        // Instantiate QRCodeStyling
        try {
            const options = {
                width: finalSize, // QR code's own size, text/padding will be added around this
                height: finalSize, // QR code's own size
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
                options.image = emojiImage; // The image itself has been generated with a size relative to finalSize
                options.imageOptions = {
                    hideBackgroundDots: true,
                    imageSize: 0.4, // This is a multiplier for the QR code module size, not absolute pixels
                    margin: Math.max(4, Math.floor(finalSize * 0.02)) // Keep margin proportional or a minimum
                };
            }

            qrCodeInstance = new QRCodeStyling(options);

            // Clear previous display first
            qrcodeDisplay.innerHTML = ''; 
            downloadBtn.classList.add('hidden'); // Hide button until ready

            const performDefaultAppend = () => {
                isCompositeImage = false;
                finalOutputCanvas = null;
                qrCodeInstance.append(qrcodeDisplay);
                downloadBtn.classList.remove('hidden');
            };

            if (topText || bottomText || overallPadding > 0) {
                isCompositeImage = true;
                
                // Use a promise-like approach for getRawData if it's not already a promise
                // Assuming qrCodeInstance.getRawData returns a Promise or can be wrapped in one.
                // For simplicity, let's assume it's thenable. If not, this needs adjustment.
                // The library's getRawData might be synchronous or callback-based.
                // The provided snippet uses .then(), so we assume it returns a Promise.
                
                // Ensure getRawData is available and is a function
                if (typeof qrCodeInstance.getRawData !== 'function') {
                    console.error("qrCodeInstance.getRawData is not a function. Cannot create composite image.");
                    performDefaultAppend(); // Fallback
                    return;
                }

                qrCodeInstance.getRawData('png').then(dataUrl => {
                    if (!dataUrl) { // Handle cases where dataUrl might be null or undefined
                        console.error("Error: getRawData returned no data URL.");
                        performDefaultAppend();
                        return;
                    }
                    const qrImage = new Image();
                    qrImage.onload = () => {
                        const qrActualSize = qrImage.width; // Actual width of the QR code image from dataUrl
                        const baseFontSize = Math.max(12, Math.floor(qrActualSize * 0.05));
                        const textLineHeight = baseFontSize * 1.2;
                        const paddingBetweenTextAndQR = Math.max(5, Math.floor(qrActualSize * 0.03));

                        let calculatedHeight = (2 * overallPadding) + qrActualSize;
                        if (topText) calculatedHeight += textLineHeight + paddingBetweenTextAndQR;
                        if (bottomText) calculatedHeight += textLineHeight + paddingBetweenTextAndQR;
                        const calculatedWidth = (2 * overallPadding) + qrActualSize;

                        finalOutputCanvas = document.createElement('canvas');
                        finalOutputCanvas.width = calculatedWidth;
                        finalOutputCanvas.height = calculatedHeight;
                        const ctx = finalOutputCanvas.getContext('2d');

                        ctx.fillStyle = backColorInput.value; // Use QR's background for padding area
                        ctx.fillRect(0, 0, calculatedWidth, calculatedHeight);

                        let currentY = overallPadding;

                        ctx.font = `${baseFontSize}px Arial`; 
                        ctx.fillStyle = fillColorInput.value; // Use QR's fill color for text
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";

                        if (topText) {
                            // For top text, Y is (overallPadding + textLineHeight / 2)
                            ctx.fillText(topText, calculatedWidth / 2, overallPadding + textLineHeight / 2);
                            currentY += textLineHeight + paddingBetweenTextAndQR;
                        } else {
                            // If no top text, QR starts directly after top padding
                            currentY = overallPadding;
                        }
                        
                        ctx.drawImage(qrImage, overallPadding, currentY, qrActualSize, qrActualSize);
                        currentY += qrActualSize;

                        if (bottomText) {
                            currentY += paddingBetweenTextAndQR;
                            ctx.fillText(bottomText, calculatedWidth / 2, currentY + textLineHeight / 2);
                        }

                        qrcodeDisplay.appendChild(finalOutputCanvas);
                        downloadBtn.classList.remove('hidden');
                    };
                    qrImage.onerror = () => {
                        console.error("Error loading QR code image for composition.");
                        qrcodeDisplay.innerHTML = '<p class="text-red-500">Error generating QR preview with text/padding. Displaying QR code only.</p>';
                        performDefaultAppend(); // Fallback to showing just the QR code
                    };
                    qrImage.src = dataUrl;
                }).catch(error => {
                    console.error("Error getting QR raw data:", error);
                    qrcodeDisplay.innerHTML = '<p class="text-red-500">Error fetching QR data. Displaying QR code only.</p>';
                    performDefaultAppend(); // Fallback
                });
            } else {
                performDefaultAppend();
            }

        } catch (error) {
            console.error("Error generating QR Code:", error);
            alert("Error generating QR Code. Check console for details.");
            downloadBtn.classList.add('hidden'); // Ensure download button remains hidden on error
            // No return here, error handling is done.
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

        if (isCompositeImage && finalOutputCanvas && format !== 'svg') {
            const imageFormat = format === 'jpeg' ? 'image/jpeg' : 'image/png';
            const fileName = 'qrcode_custom.' + (format === 'jpeg' ? 'jpg' : 'png');
            const dataUrl = finalOutputCanvas.toDataURL(imageFormat);
            
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataUrl;
            document.body.appendChild(link); // Required for Firefox
            link.click();
            document.body.removeChild(link);
        } else {
            if (isCompositeImage && format === 'svg') {
                alert("Text and padding are not applied to SVG downloads. Downloading QR code only.");
            }
            if (!qrCodeInstance) {
                alert("Please generate a QR code first.");
                return;
            }
            // Default download behavior using the library
            qrCodeInstance.download({
                name: 'qrcode',
                extension: format
            }).catch(e => console.error("Error during library download:", e));
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
    
    // Event listeners for new text and padding inputs
    if (topTextInput) {
        topTextInput.addEventListener('input', debouncedGenerateQRCode);
    }
    if (bottomTextInput) {
        bottomTextInput.addEventListener('input', debouncedGenerateQRCode);
    }
    if (paddingInput && paddingValueDisplay) {
        paddingInput.addEventListener('input', () => {
            paddingValueDisplay.textContent = paddingInput.value;
            debouncedGenerateQRCode();
        });
    }

    // Emoji Picker Logic
    if (emojiPickerButton && emojiPicker && selectedEmojiDisplay) {
        const positionEmojiPicker = () => {
            // It's tricky to get offsetHeight if the element is 'display: none'.
            // If it's the first time, or it was hidden, its offsetHeight might be 0.
            // We can temporarily make it visible but transparent and off-screen to measure.
            let pickerHeight = emojiPicker.offsetHeight;
            if (pickerHeight === 0) {
                emojiPicker.style.visibility = 'hidden';
                emojiPicker.style.display = 'block'; // Or 'inline-block', 'flex', etc., depending on the component
                pickerHeight = emojiPicker.offsetHeight;
                emojiPicker.style.display = 'none'; // Revert to original display state before toggle
                emojiPicker.style.visibility = 'visible';
                if (pickerHeight === 0) pickerHeight = 360; // Ultimate fallback
            }

            const buttonRect = emojiPickerButton.getBoundingClientRect();
            const spaceBelow = window.innerHeight - buttonRect.bottom;
            const spaceAbove = buttonRect.top;

            // Reset classes - keep right-0 as it's for horizontal alignment
            emojiPicker.classList.remove('top-full', 'bottom-full', 'mt-1', 'mb-1');

            if (spaceBelow < pickerHeight && spaceAbove > pickerHeight && spaceBelow < spaceAbove) {
                // If not enough space below, AND enough space above, AND more space above than below
                emojiPicker.classList.add('bottom-full', 'mb-1'); // Position above button
            } else {
                emojiPicker.classList.add('top-full', 'mt-1'); // Default: position below button
            }
        };

        emojiPickerButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent click from closing picker immediately
            
            // If picker is about to be shown, position it
            if (emojiPicker.classList.contains('hidden')) {
                positionEmojiPicker();
            }
            
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
    // Initialize padding display value
    if(paddingValueDisplay && paddingInput) {
        paddingValueDisplay.textContent = paddingInput.value;
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

        // Check localStorage for saved preference
        if (localStorage.getItem('darkMode') === 'enabled') {
            document.documentElement.classList.add('dark');
            darkModeToggle.checked = true;
        } else if (localStorage.getItem('darkMode') === 'disabled') {
            document.documentElement.classList.remove('dark');
            darkModeToggle.checked = false;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // If no preference in localStorage, check OS preference
            document.documentElement.classList.add('dark');
            darkModeToggle.checked = true;
            // Optionally, save this detected preference to localStorage
            // localStorage.setItem('darkMode', 'enabled'); 
        }
        // else, it defaults to light mode (no 'dark' class, toggle unchecked)

        updateIconVisibility(); // Initial icon state

        darkModeToggle.addEventListener('change', () => {
            if (darkModeToggle.checked) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('darkMode', 'enabled');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('darkMode', 'disabled');
            }
            updateIconVisibility(); // Update icons on toggle
        });

        // Listen for changes in OS preference (e.g., if user changes OS theme while page is open)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            // Only apply OS preference if no explicit user choice is stored in localStorage
            if (!localStorage.getItem('darkMode')) {
                if (e.matches) {
                    document.documentElement.classList.add('dark');
                    darkModeToggle.checked = true;
                } else {
                    document.documentElement.classList.remove('dark');
                    darkModeToggle.checked = false;
                }
                updateIconVisibility(); // Update icons on OS theme change
            }
        });
    }
});
