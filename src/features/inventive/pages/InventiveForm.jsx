import { useState } from "react";

export default function ProjectForm() {
  const [formData, setFormData] = useState({
    roll: "",
    branch: "",
    year: "",
    name: "",
    age: "",
    dob: "",
    mobile: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.roll) newErrors.roll = "Roll number is required";
    if (!formData.branch) newErrors.branch = "Branch is required";
    if (!formData.year) newErrors.year = "Year of study is required";
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.age || formData.age <= 0) newErrors.age = "Valid age is required";
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Enter a valid 10-digit mobile number";
    if (!formData.description) newErrors.description = "Project description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // First validate the form
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/inventiveForm/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const message = await response.text();
        alert(message || "Form submitted successfully!");
        console.log(message);
        // Reset form on successful submission
        setFormData({
          roll: "",
          branch: "",
          year: "",
          name: "",
          age: "",
          dob: "",
          mobile: "",
          description: "",
        });
        setErrors({});
      } else {
        const errorMessage = await response.text();

      
alert(`Error: ${errorMessage}`);

      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Network error. Please check if the server is running on port 3001.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-zinc-900 shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-yellow-400 mb-6 text-center">
          Inventive Form
        </h1>

        <div className="space-y-5">
          {/* Row 1: Roll Number + Name */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-white mb-2">Roll Number</label>
              <input
                type="text"
                name="roll"
                value={formData.roll}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter Roll Number"
                disabled={isSubmitting}
              />
              {errors.roll && <p className="text-red-500 text-sm mt-1">{errors.roll}</p>}
            </div>

            <div className="flex-1">
              <label className="block text-white mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter Name"
                disabled={isSubmitting}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
          </div>

          {/* Row 2: Branch + Year */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-white mb-2">Branch</label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                disabled={isSubmitting}
              >
                <option value="">Select Branch</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="EEE">Electrical (EEE)</option>
                <option value="MECH">Mechanical (ME)</option>
                <option value="CIVIL">Civil (CE)</option>
                <option value="IT">Information Technology (IT)</option>
              </select>
              {errors.branch && <p className="text-red-500 text-sm mt-1">{errors.branch}</p>}
            </div>

            <div className="flex-1">
              <label className="block text-white mb-2">Year of Study</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                disabled={isSubmitting}
              >
                <option value="">Select Year</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
              {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
            </div>
          </div>

          {/* Row 3: Age + DOB */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-white mb-2">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter Age"
                min="1"
                max="100"
                disabled={isSubmitting}
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            <div className="flex-1">
              <label className="block text-white mb-2">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                disabled={isSubmitting}
              />
              {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
            </div>
          </div>

          {/* Row 4: Mobile */}
          <div>
            <label className="block text-white mb-2">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter Mobile Number"
              maxLength="10"
              disabled={isSubmitting}
            />
            {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
          </div>

          {/* Project Description */}
          <div>
            <label className="block text-white mb-2">Brief Description of Project</label>
            <textarea
              rows="6"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-400 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-vertical"
              placeholder="Describe your project in detail..."
              disabled={isSubmitting}
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-6 py-3 font-semibold rounded-xl shadow-md transition ${
                isSubmitting
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-yellow-400 text-black hover:bg-yellow-300"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}