import { useState } from "react";
import "../App.css";

function UploadBox() {
  const [status, setStatus] =
    useState<string>("");

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> {
    if (!e.target.files?.length) return;

    const formData = new FormData();

    formData.append(
      "file",
      e.target.files[0]
    );

    setStatus("Uploading PDF...");

    try {
      const res = await fetch(
        "https://racheljoseph-webdev-backend.azurewebsites.net/input",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();

      setStatus(
        `✓ PDF uploaded (${data.total_chunks} chunks indexed)`
      );
    } catch {
      setStatus("Upload failed");
    }
  }

  return (
    <div className="upload-box">
      <label className="upload-button">
        Upload PDF

        <input
          type="file"
          accept=".pdf"
          onChange={handleUpload}
        />
      </label>

      {status && (
        <p className="upload-status">
          {status}
        </p>
      )}
    </div>
  );
}

export default UploadBox;