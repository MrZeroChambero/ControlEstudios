import React, { useState, useCallback, useEffect } from "react";
import { LuImage, LuDownload } from "react-icons/lu";

// Main App component
export const CargarImagenes = () => {
  const [images, setImages] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");

  // Function to handle folder selection
  const handleFolderChange = useCallback((event) => {
    const files = event.target.files;
    if (files.length === 0) {
      setImages([]);
      setFolderName("");
      setJsonOutput("");
      return;
    }

    // Get the folder name from the first file's path
    const folderPath = files[0].webkitRelativePath;
    const name = folderPath.substring(0, folderPath.indexOf("/"));
    setFolderName(name);

    // Filter for image files and process them
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    const newImages = imageFiles.map((file, index) => {
      // Create a temporary URL for image preview
      const imageUrl = URL.createObjectURL(file);
      const newFileName = `${name}_${index + 1}${file.name.substring(
        file.name.lastIndexOf(".")
      )}`;
      return {
        originalFile: file,
        newFileName,
        imageUrl,
      };
    });

    setImages(newImages);

    // Generate the JSON content
    const imageNames = newImages.map((img) => img.newFileName);
    const jsonObject = {
      fotos: imageNames,
    };
    setJsonOutput(JSON.stringify(jsonObject, null, 2));
  }, []);

  // Function to download the JSON as a text file
  const downloadJsonFile = useCallback(() => {
    if (!jsonOutput) return;

    const element = document.createElement("a");
    const file = new Blob([jsonOutput], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "fotos_renombradas.txt";
    document.body.appendChild(element); // Required for Firefox
    element.click();
    document.body.removeChild(element);
  }, [jsonOutput]);

  // Effect to clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.imageUrl));
    };
  }, [images]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-2xl bg-gray-800 rounded-2xl shadow-2xl p-8 transition-all duration-300 hover:shadow-xl">
        <h1 className="text-4xl font-bold text-center mb-2 text-blue-400">
          Renombrador de Imágenes
        </h1>
        <p className="text-center text-gray-400 mb-6">
          Selecciona una carpeta para simular el proceso de renombrar imágenes y
          generar un archivo JSON.
        </p>

        {/* File input for folder selection */}
        <div className="flex justify-center mb-8">
          <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 flex items-center shadow-lg hover:shadow-xl">
            <LuImage className="mr-2" />
            <span>Seleccionar Carpeta</span>
            {/* The webkitdirectory attribute allows folder selection */}
            <input
              type="file"
              onChange={handleFolderChange}
              webkitdirectory=""
              mozdirectory=""
              className="hidden"
            />
          </label>
        </div>

        {/* Display content if images are found */}
        {images.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center text-gray-200 mb-4">
              Imágenes de la Carpeta "{folderName}"
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8 max-h-96 overflow-y-auto pr-2">
              {images.map((img, index) => (
                <div
                  key={img.newFileName}
                  className="bg-gray-700 rounded-lg p-4 shadow-md flex flex-col items-center"
                >
                  <img
                    src={img.imageUrl}
                    alt={`Preview ${index}`}
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                  <p className="text-sm text-gray-300 text-center font-mono break-words">
                    {img.newFileName}
                  </p>
                </div>
              ))}
            </div>

            {/* JSON Output and Download button */}
            <div className="mt-6 p-4 bg-gray-700 rounded-lg shadow-inner">
              <h3 className="text-xl font-semibold mb-2 text-gray-200">
                Contenido JSON
              </h3>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
                <code>{jsonOutput}</code>
              </pre>
              <div className="flex justify-center mt-4">
                <button
                  onClick={downloadJsonFile}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-colors duration-300 flex items-center shadow-lg"
                >
                  <LuDownload className="mr-2" />
                  <span>Descargar TXT</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Display message if no images are found */}
        {images.length === 0 && folderName && (
          <p className="text-center text-red-400 mt-8">
            No se encontraron imágenes en la carpeta seleccionada.
          </p>
        )}
      </div>
    </div>
  );
};
