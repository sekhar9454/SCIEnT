import { useState } from "react";
import {
  Instagram,
  Linkedin,
  MessageCircle,
  QrCode,
  HelpCircle,
} from "lucide-react";

export default function ProjectForm() {
  const [formData, setFormData] = useState({
    roll: "",
    branch: "",
    year: "",
    name: "",
    age: "",
    dob: "",
    mobile: "",
    source: "",
    otherSource: "",
    projectDescription: "",
    problemStatement: "",
    teamSize: 1,
    members: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleTeamSizeChange = (e) => {
    const size = parseInt(e.target.value) || 1;
    setFormData({
      ...formData,
      teamSize: size,
      members: Array(size - 1)
        .fill()
        .map(
          (_, i) =>
            formData.members[i] || { name: "", roll: "", branch: "", year: "" }
        ),
    });
  };

  const handleMemberChange = (index, field, value) => {
    const updated = [...formData.members];
    updated[index][field] = value;
    setFormData({ ...formData, members: updated });
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.roll) newErrors.roll = "Roll number is required";
    if (!formData.branch) newErrors.branch = "Branch is required";
    if (!formData.year) newErrors.year = "Year of study is required";
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.age || formData.age <= 0)
      newErrors.age = "Valid age is required";
    if (!formData.dob) newErrors.dob = "Date of Birth is required";
    if (!/^\d{10}$/.test(formData.mobile))
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    if (!formData.source) newErrors.source = "Please select an option";
    if (formData.source === "Other" && !formData.otherSource)
      newErrors.otherSource = "Please specify other source";
    if (!formData.projectDescription && !formData.problemStatement) {
      newErrors.projectDescription = "Enter a description or select a problem statement";
    }
    if (!formData.teamSize) newErrors.teamSize = "Please enter team size";

    formData.members.forEach((member, i) => {
      if (!member.name)
        newErrors[`member${i}_name`] = `Member ${i + 2} name required`;
      if (!member.roll)
        newErrors[`member${i}_roll`] = `Member ${i + 2} roll required`;
      if (!member.branch)
        newErrors[`member${i}_branch`] = `Member ${i + 2} branch required`;
      if (!member.year)
        newErrors[`member${i}_year`] = `Member ${i + 2} year required`;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const payload = {
  ...formData,
  projectDescription: formData.projectDescription || formData.problemStatement,
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
        // Reset form on successful submission
        setFormData({
          roll: "",
          branch: "",
          year: "",
          name: "",
          age: "",
          dob: "",
          mobile: "",
          source: "",
          otherSource: "",
          projectDescription: "",
          problemStatement: "",
          teamSize: 1,
          members: [],
        });
        setErrors({});
      } else {
        const errorMessage = await response.text();
        alert(`Error: ${errorMessage}`);
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert(
        "Network error. Please check if the server is running on port 3001."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative top-16 mb-16 bg-gradient-to-br from-black via-zinc-900 to-black flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-zinc-950 shadow-2xl rounded-2xl p-10 border border-yellow-500/30">
        <h1 className="text-4xl font-extrabold text-yellow-400 mb-3 text-center drop-shadow-lg">
          Inventive Form
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Submit your details and project info below
        </p>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Personal Details Section */}
          <div className="bg-zinc-900/60 rounded-xl p-6 shadow-md border border-zinc-800">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">
              Personal Details
            </h2>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-white mb-2">Roll Number</label>
                <input
                  type="text"
                  name="roll"
                  value={formData.roll}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter Roll Number"
                />
                {errors.roll && (
                  <p className="text-red-500 text-sm mt-1">{errors.roll}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-white mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter Name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-white mb-2">Branch</label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Select Branch</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Chemical Engineering">
                    Chemical Engineering
                  </option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Computer Science and Engineering">
                    Computer Science and Engineering
                  </option>
                  <option value="Electrical and Electronics Engineering">
                    Electrical and Electronics Engineering
                  </option>
                  <option value="Electronics and Communication Engineering">
                    Electronics and Communication Engineering
                  </option>
                  <option value="Instrumentation and Control Engineering">
                    Instrumentation and Control Engineering
                  </option>
                  <option value="Mechanical Engineering">
                    Mechanical Engineering
                  </option>
                  <option value="Metallurgical and Materials Engineering">
                    Metallurgical and Materials Engineering
                  </option>
                  <option value="Production Engineering">
                    Production Engineering
                  </option>
                </select>
                {errors.branch && (
                  <p className="text-red-500 text-sm mt-1">{errors.branch}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-white mb-2">Year of Study</label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
                {errors.year && (
                  <p className="text-red-500 text-sm mt-1">{errors.year}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-white mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Enter Age"
                />
                {errors.age && (
                  <p className="text-red-500 text-sm mt-1">{errors.age}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-white mb-2">Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                {errors.dob && (
                  <p className="text-red-500 text-sm mt-1">{errors.dob}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-white mb-2">Mobile Number</label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Enter Mobile Number"
              />
              {errors.mobile && (
                <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
              )}
            </div>
          </div>

          {/* Source Section */}
          <div className="bg-zinc-900/60 rounded-xl p-6 shadow-md border border-zinc-800">
            <label className="text-xl font-semibold text-yellow-300 mb-4 block">
              How did you get to know about Inventive?
            </label>

            <div className="flex flex-wrap gap-3">
              {[
                { label: "Instagram", icon: <Instagram size={18} /> },
                { label: "Linkedin", icon: <Linkedin size={18} /> },
                { label: "WhatsApp Groups", icon: <MessageCircle size={18} /> },
                { label: "Offline QR Codes", icon: <QrCode size={18} /> },
                { label: "Other", icon: <HelpCircle size={18} /> },
              ].map(({ label, icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFormData({ ...formData, source: label })}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all
          ${
            formData.source === label
              ? "bg-yellow-400 text-black border-yellow-400"
              : "bg-black text-white border-yellow-400/70 hover:bg-yellow-500 hover:text-black"
          }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>

            {formData.source === "Other" && (
              <input
                type="text"
                name="otherSource"
                placeholder="Please specify..."
                value={formData.otherSource}
                onChange={handleChange}
                className="mt-3 w-full px-4 py-2 rounded-lg bg-black border border-yellow-400/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            )}

            {errors.source && (
              <p className="text-red-500 text-sm mt-2">{errors.source}</p>
            )}
            {errors.otherSource && (
              <p className="text-red-500 text-sm mt-2">{errors.otherSource}</p>
            )}
          </div>

          {/* Project Details Section */}
          <div className="bg-zinc-900/60 rounded-xl p-6 shadow-md border border-zinc-800">
            <h2 className="text-xl font-semibold text-yellow-300 mb-4">
              Project Details
            </h2>
            <div>
              <label className="block text-white mb-2">
                Brief Description of Project
              </label>
              <textarea
                rows="6"
                name="projectDescription"
                value={formData.projectDescription}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg bg-black border border-yellow-400/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Describe your project in detail..."
              ></textarea>
              {errors.projectDescription && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.projectDescription}
                </p>
              )}
            </div>
            {/* OR Separator */}
<div className="text-center my-4 text-gray-400 font-semibold">OR</div>

{/* Dropdown for Problem Statements */}
<div>
    <label className="block text-white mb-2">
      Choose a Problem Statement
    </label>
    <select
      onChange={(e) =>
        setFormData({ ...formData,problemStatement: e.target.value })
      }
      value={formData.problemStatement}
      className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
    >
      <option value="">Select a problem statement</option>
      <option value="Pick and Place using VLA for Collaborative Robot (COBOT)">
        Pick and Place using VLA for Collaborative Robot (COBOT)
      </option>
      <option value="Aggressive maneuver Stabilization for a Minidrone">
        Aggressive maneuver Stabilization for a Minidrone
      </option>
      <option value="Portable Charging System for Electric Vehicles">
        Portable Charging System for Electric Vehicles
      </option>
      <option value="Autonomous Vehicle Localization Using Onboard Sensors and HD Geolocated Maps">
        Autonomous Vehicle Localization Using Onboard Sensors and HD Geolocated Maps
      </option>
      <option value="Automated Testing of All Electrical Accessories in QC Station of an Automobile Factory">
        Automated Testing of All Electrical Accessories in QC Station of an Automobile Factory
      </option>
      <option value="Vehicle Borne Edge AI for Electric Vehicle Driver Safety Assistance">
        Vehicle Borne Edge AI for Electric Vehicle Driver Safety Assistance
      </option>
      <option value="AI enabled object reorientation system for industrial production lines">
        AI enabled object reorientation system for industrial production lines
      </option>
    </select>
  </div>
            {/* Team Size */}
            <div className="mb-4">
              <label className="block text-white mb-2">Team Size</label>
              <input
                type="number"
                name="teamSize"
                min="1"
                max="10"
                value={formData.teamSize}
                onChange={handleTeamSizeChange}
                className="w-full px-4 py-2 rounded-lg bg-black border border-yellow-400/70 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              {errors.teamSize && (
                <p className="text-red-500 text-sm mt-1">{errors.teamSize}</p>
              )}
            </div>

            {/* Other Members */}
            {formData.members.map((member, index) => (
              <div
                key={index}
                className="mb-6 p-4 border-2 border-black rounded-lg bg-black shadow-md"
              >
                <h3 className="font-semibold text-lg mb-3 text-white">
                  Member {index + 2} Details
                </h3>

                {/* Name */}
                <div className="mb-3">
                  <label className="block mb-1 text-white">Name</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) =>
                      handleMemberChange(index, "name", e.target.value)
                    }
                    className="w-full p-2 border border-yellow-400 rounded bg-black text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Enter name"
                  />
                  {errors[`member${index}_name`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`member${index}_name`]}
                    </p>
                  )}
                </div>

                {/* Roll Number */}
                <div className="mb-3">
                  <label className="block mb-1 text-white">Roll Number</label>
                  <input
                    type="text"
                    value={member.roll}
                    onChange={(e) =>
                      handleMemberChange(index, "roll", e.target.value)
                    }
                    className="w-full p-2 border border-yellow-400 rounded bg-black text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Enter roll number"
                  />
                  {errors[`member${index}_roll`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`member${index}_roll`]}
                    </p>
                  )}
                </div>

                {/* Branch */}
                <div className="mb-3">
                  <label className="block mb-1 text-white">Branch</label>
                  <select
                    value={member.branch}
                    onChange={(e) =>
                      handleMemberChange(index, "branch", e.target.value)
                    }
                    className="w-full p-2 border border-yellow-400 rounded bg-black text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Select Branch</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Chemical Engineering">
                      Chemical Engineering
                    </option>
                    <option value="Civil Engineering">Civil Engineering</option>
                    <option value="Computer Science and Engineering">
                      Computer Science and Engineering
                    </option>
                    <option value="Electrical and Electronics Engineering">
                      Electrical and Electronics Engineering
                    </option>
                    <option value="Electronics and Communication Engineering">
                      Electronics and Communication Engineering
                    </option>
                    <option value="Instrumentation and Control Engineering">
                      Instrumentation and Control Engineering
                    </option>
                    <option value="Mechanical Engineering">
                      Mechanical Engineering
                    </option>
                    <option value="Metallurgical and Materials Engineering">
                      Metallurgical and Materials Engineering
                    </option>
                    <option value="Production Engineering">
                      Production Engineering
                    </option>
                  </select>
                  {errors[`member${index}_branch`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`member${index}_branch`]}
                    </p>
                  )}
                </div>

                {/* Year */}
                <div className="mb-3">
                  <label className="block mb-1 text-white">Year</label>
                  <select
                    value={member.year}
                    onChange={(e) =>
                      handleMemberChange(index, "year", e.target.value)
                    }
                    className="w-full p-2 border border-yellow-400 rounded bg-black text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Select Year</option>
                    <option value="1st">1st Year</option>
                    <option value="2nd">2nd Year</option>
                    <option value="3rd">3rd Year</option>
                    <option value="4th">4th Year</option>
                  </select>
                  {errors[`member${index}_year`] && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors[`member${index}_year`]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="px-8 py-3 bg-yellow-400 text-black font-bold rounded-xl shadow-lg hover:bg-yellow-300 hover:scale-105 transform transition duration-300"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
