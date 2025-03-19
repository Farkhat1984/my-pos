/**
 * Barcode scanning service
 * Provides methods for barcode detection using the device camera
 */
class BarcodeService {
    constructor() {
      this.isInitialized = false;
      this.scanner = null;
      this.stream = null;
      this.scanInterval = null;
      this.lastResult = null;
      this.scanCallback = null;
    }
  
    /**
     * Initialize the barcode scanner
     * @returns {Promise<boolean>} - Success status
     */
    async initialize() {
      try {
        // Import ZXing dynamically
        if (!window.ZXing) {
          await this.loadZXingLibrary();
        }
        
        this.isInitialized = true;
        return true;
      } catch (error) {
        console.error('Failed to initialize barcode scanner:', error);
        return false;
      }
    }
  
    /**
     * Load ZXing library
     * @returns {Promise<void>}
     */
    loadZXingLibrary() {
      return new Promise((resolve, reject) => {
        if (window.ZXing) {
          resolve();
          return;
        }
  
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@zxing/library@0.20.0/umd/index.min.js';
        script.async = true;
        script.onload = () => {
          console.log('ZXing library loaded');
          resolve();
        };
        script.onerror = () => reject(new Error('Failed to load ZXing library'));
        document.head.appendChild(script);
      });
    }
  
    /**
     * Checks if the device has a camera
     * @returns {Promise<boolean>} - True if camera is available
     */
    async hasCamera() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.some(device => device.kind === 'videoinput');
      } catch (error) {
        console.error('Error checking for camera:', error);
        return false;
      }
    }
  
    /**
     * Gets available cameras
     * @returns {Promise<MediaDeviceInfo[]>} - Array of camera devices
     */
    async getCameras() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter(device => device.kind === 'videoinput');
      } catch (error) {
        console.error('Error getting cameras:', error);
        return [];
      }
    }
  
    /**
     * Start camera stream
     * @param {HTMLVideoElement} videoElement - Video element to display the camera
     * @param {string|null} deviceId - Optional device ID for specific camera
     * @returns {Promise<MediaStream|null>} - Camera stream or null on error
     */
    async startCamera(videoElement, deviceId = null) {
      try {
        // Stop any existing stream
        this.stopCamera();
  
        // Define camera constraints
        const constraints = {
          video: {
            facingMode: 'environment', // Prefer back camera
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        };
  
        // If specific device ID is provided
        if (deviceId) {
          constraints.video = { deviceId: { exact: deviceId } };
        }
  
        // Get the media stream
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        this.stream = stream;
  
        // Set the stream to the video element
        if (videoElement) {
          videoElement.srcObject = stream;
          
          // Make sure video plays automatically
          videoElement.setAttribute('playsinline', 'true');
          videoElement.setAttribute('autoplay', 'true');
          videoElement.setAttribute('muted', 'true');
          
          // Wait for video to be ready
          await new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
              videoElement.play().then(resolve).catch(resolve);
            };
            
            // In case the video is already loaded
            if (videoElement.readyState >= 2) {
              videoElement.play().then(resolve).catch(resolve);
            }
          });
        }
  
        return stream;
      } catch (error) {
        console.error('Error starting camera:', error);
        
        if (error.name === 'NotAllowedError') {
          throw new Error('Camera access denied. Please grant camera permission.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No camera found on this device.');
        } else {
          throw new Error(`Camera error: ${error.message}`);
        }
      }
    }
  
    /**
     * Stop camera stream
     */
    stopCamera() {
      if (this.stream) {
        const tracks = this.stream.getTracks();
        tracks.forEach(track => track.stop());
        this.stream = null;
      }
      
      if (this.scanInterval) {
        clearInterval(this.scanInterval);
        this.scanInterval = null;
      }
    }
  
    /**
     * Start scanning for barcodes
     * @param {HTMLVideoElement} videoElement - Video element with the camera feed
     * @param {Function} callback - Function to call when a barcode is detected
     * @param {string|null} deviceId - Optional device ID for specific camera
     */
    async startScanning(videoElement, callback, deviceId = null) {
      if (!this.isInitialized) {
        await this.initialize();
      }
  
      // Store callback
      this.scanCallback = callback;
      
      // Initialize last result
      this.lastResult = null;
  
      try {
        // Start camera
        await this.startCamera(videoElement, deviceId);
        
        // Create barcode reader if necessary
        if (!this.scanner) {
          const hints = new Map();
          // Set formats to detect all common barcodes
          const formats = [
            ZXing.BarcodeFormat.QR_CODE,
            ZXing.BarcodeFormat.CODE_128,
            ZXing.BarcodeFormat.CODE_39,
            ZXing.BarcodeFormat.CODE_93,
            ZXing.BarcodeFormat.EAN_13,
            ZXing.BarcodeFormat.EAN_8,
            ZXing.BarcodeFormat.UPC_A,
            ZXing.BarcodeFormat.UPC_E,
            ZXing.BarcodeFormat.DATA_MATRIX,
            ZXing.BarcodeFormat.ITF
          ];
          hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
          hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
          
          this.scanner = new ZXing.MultiFormatReader();
          this.scanner.setHints(hints);
        }
  
        // Start scanning interval
        this.scanInterval = setInterval(() => {
          this.scanBarcode(videoElement);
        }, 200); // Scan every 200ms
        
      } catch (error) {
        console.error('Error starting barcode scanning:', error);
        throw error;
      }
    }
  
    /**
     * Scan for barcode in the current video frame
     * @param {HTMLVideoElement} videoElement - Video element with the camera feed
     */
    scanBarcode(videoElement) {
      if (!videoElement || videoElement.readyState !== videoElement.HAVE_ENOUGH_DATA) {
        return;
      }
  
      try {
        // Create temporary canvas to process the frame
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match video
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        // Draw video frame to canvas
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Create luminance source
        const luminanceSource = new ZXing.HTMLCanvasElementLuminanceSource(canvas);
        const binaryBitmap = new ZXing.BinaryBitmap(new ZXing.HybridBinarizer(luminanceSource));
        
        try {
          // Try to decode the image
          const result = this.scanner.decode(binaryBitmap);
          
          // If we got a result and it's different from the last one
          if (result && result.text !== this.lastResult) {
            this.lastResult = result.text;
            
            // Call callback with barcode text
            if (this.scanCallback) {
              this.scanCallback(result.text);
            }
          }
        } catch (error) {
          // No barcode found in this frame, this is normal
          if (!(error instanceof ZXing.NotFoundException)) {
            console.error('Scanning error:', error);
          }
        }
      } catch (error) {
        console.error('Error processing video frame:', error);
      }
    }
  
    /**
     * Stop scanning
     */
    stopScanning() {
      this.stopCamera();
      this.scanCallback = null;
    }
  }
  
  // Create a singleton instance
  const barcodeService = new BarcodeService();
  
  export default barcodeService;