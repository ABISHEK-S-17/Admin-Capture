import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";
import toast, { Toaster } from "react-hot-toast";

export default function EditPortfolio() {
  const navigate = useNavigate();
  const { id } = useParams();

  // ✅ images
  const [preview, setPreview] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);

  // ✅ youtube link
  const [videoLinks, setVideoLinks] = useState([""]);


  const {
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    fetchPortfolio();
  }, [id]);

  useEffect(() => {
    return () => {
      preview.forEach((p) => p.file && URL.revokeObjectURL(p.url));
    };
  }, [preview]);

  /* ================= FETCH ================= */

  const fetchPortfolio = async () => {
    try {
      const res = await api.get("/admin/portfolio/getPortfolios");
      const portfolio = res.data.data.find((p) => p.id === Number(id));

      if (!portfolio) {
        toast.error("Portfolio not found");
        navigate("/portfolio");
        return;
      }

      setValue("title", portfolio.title);
      setValue("category", portfolio.category);
      setValue("description", portfolio.description);
      setVideoLinks(
        Array.isArray(portfolio.videoLink) && portfolio.videoLink.length
          ? portfolio.videoLink
          : [""]
      );


      // ✅ existing images
      if (Array.isArray(portfolio.images)) {
        setPreview(
          portfolio.images.map((img) => ({
            id: crypto.randomUUID(),
            url: `${import.meta.env.VITE_API_BASE_URL}${img}`,
            file: null,
          }))
        );
      }
    } catch (err) {
      toast.error("Failed to load portfolio");
      console.error(err);
    }
  };

  /* ================= IMAGE HANDLERS ================= */

  const removeImage = (id) => {
    setPreview((prev) => {
      const img = prev.find((i) => i.id === id);
      if (img?.file) URL.revokeObjectURL(img.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleDragStart = (index) => setDragIndex(index);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) return;

    setPreview((prev) => {
      const arr = [...prev];
      const dragged = arr[dragIndex];
      arr.splice(dragIndex, 1);
      arr.splice(dropIndex, 0, dragged);
      return arr;
    });

    setDragIndex(null);
  };

  /* ================= SUBMIT ================= */

  const onSubmit = async () => {
    try {
      const formData = new FormData();

      formData.append("id", id);
      formData.append("title", getValues("title"));
      formData.append("category", getValues("category"));
      formData.append("description", getValues("description"));
      formData.append(
        "videoLink",
        videoLinks
          .filter((v) => v.trim() !== "")
          .join(",")    // ✅ simple string
      );

    


      // ✅ existing images
      const existingImages = preview
        .filter((i) => !i.file)
        .map((i) =>
          i.url.replace(import.meta.env.VITE_API_BASE_URL, "")
        );

      formData.append("existingImages", JSON.stringify(existingImages));

      // ✅ new images
      preview.forEach((item) => {
        if (item.file) formData.append("image", item.file);
      });

      await api.put("/admin/portfolio/updatePortfolio", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Portfolio updated successfully!");
      setTimeout(() => navigate("/portfolio"), 800);
    } catch (err) {
      toast.error("Update failed");
      console.error(err);
    }
  };

  // ✅ youtube embed
  const getEmbedUrl = (url) => {
    if (!url) return "";

    try {
      const parsed = new URL(url);

      // youtu.be/<id>
      if (parsed.hostname.includes("youtu.be")) {
        return `https://www.youtube.com/embed${parsed.pathname}`;
      }

      // youtube.com/watch?v=<id>
      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      return "";
    } catch (err) {
      return "";
    }
  };


  const addVideoField = () => {
    setVideoLinks((prev) => [...prev, ""]);
  };

  const removeVideoField = (index) => {
    setVideoLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVideo = (index, value) => {
    setVideoLinks((prev) =>
      prev.map((v, i) => (i === index ? value : v))
    );
  };

  useEffect(() => {
    console.log("videoLinks:", videoLinks);
  }, [videoLinks]);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Toaster position="top-center" />
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border p-6 w-full">

            <button
              onClick={() => navigate("/portfolio")}
              className="mb-6 px-4 py-2 rounded-lg text-sm font-medium
                         bg-black text-white hover:bg-white hover:text-black
                         border transition"
            >
              ← Back to Portfolios
            </button>

            <h2 className="text-2xl font-semibold mb-6">Edit Portfolio</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Portfolio Title
                </label>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Portfolio title is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full h-11 px-4 border rounded-lg focus:ring-1 focus:ring-black"
                    />
                  )}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Portfolio Category
                </label>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Portfolio category is required" }}
                  render={({ field }) => (
                    <input
                      {...field}
                      className="w-full h-11 px-4 border rounded-lg focus:ring-1 focus:ring-black"
                    />
                  )}
                />
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: "Description is required" }}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows="3"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-1 focus:ring-black"
                    />
                  )}
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Portfolio Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setPreview((prev) => {
                      const mapped = files.map((file) => ({
                        id: crypto.randomUUID(),
                        url: URL.createObjectURL(file),
                        file,
                      }));
                      return [...prev, ...mapped];
                    });
                  }}
                />

                <div className="mt-4 flex flex-wrap gap-4">
                  {preview.map((item, index) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      className="relative border rounded-lg p-2 cursor-move"
                      style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}
                    >
                      <img
                        src={item.url}
                        className="w-64 h-36 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(item.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Links */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  YouTube Video Links
                </label>

                {videoLinks.map((link, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={link}
                        onChange={(e) => updateVideo(index, e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=xxxx"
                        className="flex-1 h-11 px-4 border rounded-lg"
                      />

                      {videoLinks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVideoField(index)}
                          className="px-3 rounded bg-red-600 text-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Preview */}
                    {link && getEmbedUrl(link) && (
                      <div className="mt-2 w-full max-w-xl aspect-video border rounded-lg overflow-hidden">
                        <iframe
                          src={getEmbedUrl(link)}
                          loading="lazy"
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    )}

                  </div>
                ))}

                <button
                  type="button"
                  onClick={addVideoField}
                  className="mt-2 px-4 py-2 rounded bg-black text-white text-sm"
                >
                  + Add another video
                </button>
              </div>


              {/* Submit */}
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 w-48 rounded-lg bg-green-600 text-white
                             hover:bg-white hover:text-green-600 border transition"
                >
                  {isSubmitting ? "Updating..." : "Update Portfolio"}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
