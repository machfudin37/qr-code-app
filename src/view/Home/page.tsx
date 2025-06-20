import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const QRCodeGenerator = () => {
  const [input, setInput] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [submitInput, setSubmitInput] = useState("");

  //Tema handling
  const [darkMode, setDarkMode] = useState(() => {
    // Check local storage or system preference
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode !== null) {
        return savedMode === "true";
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save preference to local storage
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const generateQRCode = async () => {
    if (!input.trim()) {
      toast.error("Please enter text or URL");
      return;
    }

    try {
      setSubmitInput(input);
      const generatedQR = await QRCode.toDataURL(input, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrCode(generatedQR);
      toast.success("QR Code generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate QR Code");
    }
  };

  const resetQRCode = () => {
    setQrCode("");
    setInput("");
  };
  const getFileName = (base = "qrcode") => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    return `${base}-${day}-${month}-${year}`;
  };
  const fileName = getFileName();

  const downloadQRCodeAsImage = async () => {
    if (!qrCodeRef.current) return;

    try {
      const canvas = await html2canvas(qrCodeRef.current);
      const link = document.createElement("a");
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("QR Code downloaded as image!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download QR Code as image");
    }
  };

  const downloadQRCodeAsPDF = async () => {
    if (!qrCodeRef.current) return;

    try {
      const canvas = await html2canvas(qrCodeRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Ukuran QR Code di PDF (misalnya setengah dari halaman)
      const qrWidth = pageWidth / 2;
      const qrHeight = (canvas.height * qrWidth) / canvas.width;

      // Posisi tengah
      const x = (pageWidth - qrWidth) / 2;
      const y = (pageHeight - qrHeight) / 2;

      pdf.addImage(imgData, "PNG", x, y, qrWidth, qrHeight);
      pdf.save(`${fileName}.pdf`); // Gunakan filename yang sudah reusable
      toast.success("QR Code downloaded as PDF!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to download QR Code as PDF");
    }
  };

  return (
    <div className='max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
      <div className='mb-4'>
        <label htmlFor='qr-input' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
          Masukan Text atau URL
        </label>
        <input
          id='qr-input'
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white'
          placeholder='example or https://example.com'
        />
      </div>

      <div className='flex flex-col md:flex-row flex-wrap gap-2 mb-4'>
        <div className='flex flex-wrap gap-2'>
          <button
            onClick={toggleDarkMode}
            className='p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors'
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? (
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 text-amber-300 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                />
              </svg>
            ) : (
              <svg xmlns='http://www.w3.org/2000/svg' className='h-6 text-black w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
                />
              </svg>
            )}
          </button>
          <button onClick={generateQRCode} className='flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors'>
            Generate
          </button>
        </div>

        {qrCode && (
          <>
            <button
              onClick={() => setIsModalOpen(true)}
              className='flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md transition-colors'
            >
              Display QR Code
            </button>
            <button onClick={resetQRCode} className='flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors'>
              Reset
            </button>
          </>
        )}
      </div>

      {qrCode && (
        <div className='mt-6'>
          <div className='flex flex-col items-center p-4 bg-white rounded-md'>
            <img src={qrCode} alt='Generated QR Code' className='w-48 h-48' />
            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400 break-all max-w-xs text-center'>{submitInput}</p>
          </div>
          {/* Versi yang digunakan hanya untuk download dengan html2canvas (disembunyikan dari layar) */}
          <div
            ref={qrCodeRef}
            style={{
              backgroundColor: "#ffffff",
              color: "#000000",
              padding: "1rem",
              borderRadius: "0.5rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "fit-content",
              margin: "0 auto",
              position: "absolute",
              top: "-9999px", // disembunyikan dari layar tapi tetap bisa dirender html2canvas
              left: "-9999px",
            }}
          >
            <img src={qrCode} alt='Generated QR Code' style={{ width: "192px", height: "192px" }} />
            <p style={{ marginTop: "0.5rem", color: "gray", fontSize: "0.875rem", maxWidth: "16rem", wordBreak: "break-word" }}>{submitInput}</p>
            <p style={{ marginTop: "0.5rem", color: "black", fontSize: "0.875rem", maxWidth: "16rem", wordBreak: "break-word" }}>
              Created By <span style={{ color: "blue" }}>QR Code App</span>
            </p>
          </div>

          <div className='flex flex-wrap gap-2 mt-4'>
            <button
              onClick={downloadQRCodeAsImage}
              className='flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors'
            >
              Download as Image
            </button>
            <button
              onClick={downloadQRCodeAsPDF}
              className='flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors'
            >
              Download as PDF
            </button>
          </div>
        </div>
      )}

      {/* Modal for enlarged QR Code */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4' onClick={() => setIsModalOpen(false)}>
          <div className='bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full' onClick={(e) => e.stopPropagation()}>
            <div className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-bold text-gray-800 dark:text-white'>QR Code</h2>
              <button onClick={() => setIsModalOpen(false)} className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'>
                <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>
            <div className='flex justify-center'>
              <img src={qrCode} alt='Enlarged QR Code' className='w-full max-w-xs' />
            </div>
            <p className='mt-4 text-sm text-black-600 dark:text-gray-400 text-center break-all'>{submitInput}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;
