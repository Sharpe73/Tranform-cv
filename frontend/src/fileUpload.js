import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return setMessage("Selecciona un archivo para subir.");

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error al subir el archivo.");
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">Subir Archivo</h2>
        <input type="file" className="w-full p-2 border rounded-lg mb-4" onChange={handleFileChange} />
        <button onClick={handleUpload} className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-700" disabled={uploading}>
          {uploading ? "Subiendo..." : "Subir Archivo"}
        </button>
        {message && <p className="text-center text-gray-700 mt-4">{message}</p>}
      </div>
    </div>
  );
};

export default FileUpload;
