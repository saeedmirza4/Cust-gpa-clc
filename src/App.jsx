import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [courses, setCourses] = useState([{ id: Date.now(), name: '', credits: '', grade: '' }]);
  const [pastSemesters, setPastSemesters] = useState([]);
  const [newSemesterGpa, setNewSemesterGpa] = useState('');
  const [newSemesterCredits, setNewSemesterCredits] = useState('');
  const [currentSemesterGpa, setCurrentSemesterGpa] = useState(null);
  const [academicStanding, setAcademicStanding] = useState('');
  const [totalCredits, setTotalCredits] = useState(0);

  // Ref for exportable content
  const exportRef = useRef();

  // Grade mapping: letter → point + academic standing
  const gradeMapping = {
    'A': { point: 4.0, status: 'Excellent' },
    'A−': { point: 3.67, status: 'Good' },
    'B+': { point: 3.33, status: 'Good' },
    'B': { point: 3.0, status: 'Good' },
    'B−': { point: 2.67, status: 'Satisfactory' },
    'C+': { point: 2.33, status: 'Satisfactory' },
    'C': { point: 2.0, status: 'Satisfactory' },
    'C−': { point: 1.67, status: 'Poor but passing' },
    'D+': { point: 1.33, status: 'Poor but passing' },
    'D': { point: 1.0, status: 'Fail' },
    'F': { point: 0.0, status: 'Fail' }
  };

  // Get grade point based on selected letter
  const getGradePoint = (letter) => {
    return gradeMapping[letter] || { point: 0 };
  };

  // Calculate current semester GPA
  const calculateCurrentGPA = () => {
    let totalPoints = 0;
    let totalCreditHours = 0;

    courses.forEach(course => {
      const credits = parseFloat(course.credits);
      const grade = course.grade;
      if (!isNaN(credits) && credits > 0 && gradeMapping[grade]) {
        totalPoints += getGradePoint(grade).point * credits;
        totalCreditHours += credits;
      }
    });

    if (totalCreditHours > 0) {
      const gpa = (totalPoints / totalCreditHours).toFixed(2);
      setCurrentSemesterGpa(gpa);
      setTotalCredits(totalCreditHours);
      determineAcademicStanding(gpa);
    } else {
      setCurrentSemesterGpa(null);
    }
  };

  // Determine academic standing
  const determineAcademicStanding = (gpa) => {
    if (gpa >= 3.67) setAcademicStanding('Excellent');
    else if (gpa >= 3.0) setAcademicStanding('Good');
    else if (gpa >= 2.33) setAcademicStanding('Satisfactory');
    else if (gpa >= 1.0) setAcademicStanding('Poor but passing');
    else setAcademicStanding('Fail');
  };

  // Save current semester as a past one
  const saveCurrentSemester = () => {
    if (currentSemesterGpa && totalCredits) {
      setPastSemesters([
        ...pastSemesters,
        { gpa: parseFloat(currentSemesterGpa), credits: totalCredits }
      ]);
      setCourses([{ id: Date.now(), name: '', credits: '', grade: '' }]);
      setCurrentSemesterGpa(null);
      setAcademicStanding('');
      setTotalCredits(0);
    }
  };

  // Manually add past semester
  const addManualSemester = () => {
    const gpa = parseFloat(newSemesterGpa);
    const credits = parseFloat(newSemesterCredits);
    if (!isNaN(gpa) && !isNaN(credits) && credits > 0 && gpa >= 0 && gpa <= 4) {
      setPastSemesters([...pastSemesters, { gpa, credits }]);
      setNewSemesterGpa('');
      setNewSemesterCredits('');
    }
  };

  // Calculate cumulative GPA
  const calculateCGPA = () => {
    if (pastSemesters.length === 0) return 'N/A';
    let totalPoints = 0;
    let totalCredits = 0;
    pastSemesters.forEach(sem => {
      totalPoints += sem.gpa * sem.credits;
      totalCredits += sem.credits;
    });
    return (totalPoints / totalCredits).toFixed(2);
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Effect to calculate GPA on every change
  useEffect(() => {
    calculateCurrentGPA();
  }, [courses]);

  // Handle input changes
  const handleInputChange = (id, field, value) => {
    setCourses(prev =>
      prev.map(course =>
        course.id === id ? { ...course, [field]: value } : course
      )
    );
  };

  // Add new course row
  const addCourse = () => {
    setCourses(prev => [...prev, { id: Date.now(), name: '', credits: '', grade: '' }]);
  };

  // Remove a course by ID
  const removeCourse = (id) => {
    setCourses(prev => prev.filter(course => course.id !== id));
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      const html2canvas = await import('html2canvas').then(module => module.default);
      const jsPDF = await import('jspdf').then(module => module.default);

      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('GPA_CGPA_Report.pdf');
    } catch (error) {
      alert('Failed to generate PDF. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`p-4 shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">🎓 GPA & CGPA Calculator</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-full transition-colors ${darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-white'}`}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 space-y-8">
        {/* Current Semester Section */}
        <section className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">📘 Current Semester GPA</h2>

          {/* Course Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <th className="py-2 px-4 text-left">Course Name</th>
                  <th className="py-2 px-4 text-left">Credit Hours</th>
                  <th className="py-2 px-4 text-left">Grade</th>
                  <th className="py-2 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className={`${darkMode ? 'border-gray-700' : 'border-gray-200'} border-b`}>
                    <td className="py-2 px-4">
                      <input
                        type="text"
                        placeholder="e.g., Math"
                        value={course.name}
                        onChange={(e) => handleInputChange(course.id, 'name', e.target.value)}
                        className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border`}
                      />
                    </td>
                    <td className="py-2 px-4">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        placeholder="e.g., 3"
                        value={course.credits}
                        onChange={(e) => handleInputChange(course.id, 'credits', e.target.value)}
                        className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border`}
                      />
                    </td>
                    <td className="py-2 px-4">
                      <select
                        value={course.grade}
                        onChange={(e) => handleInputChange(course.id, 'grade', e.target.value)}
                        className={`w-full p-2 rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border`}
                      >
                        <option value="">Select Grade</option>
                        {Object.keys(gradeMapping).map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => removeCourse(course.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Course Button */}
          <div className="mt-4 flex justify-between">
            <button
              onClick={addCourse}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              ➕ Add Course
            </button>
            <button
              onClick={saveCurrentSemester}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              ✅ Save Semester
            </button>
          </div>

          {/* GPA Summary Card */}
          {currentSemesterGpa && (
            <div className={`mt-6 p-4 rounded-lg shadow-md ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <h3 className="font-bold text-lg">📊 Semester Summary</h3>
              <p>Total Credit Hours: <strong>{totalCredits}</strong></p>
              <p>Semester GPA: <strong>{currentSemesterGpa}</strong></p>
              <p>Academic Standing: <strong>{academicStanding}</strong></p>
            </div>
          )}
        </section>

        {/* Past Semesters Section */}
        <section className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">📈 Cumulative GPA (CGPA)</h2>

          {/* Manual Entry Form */}
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              placeholder="Enter SGPA (0–4)"
              value={newSemesterGpa}
              onChange={(e) => setNewSemesterGpa(e.target.value)}
              className={`p-2 rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border`}
              step="0.01"
              min="0"
              max="4"
            />
            <input
              type="number"
              placeholder="Credit hours"
              value={newSemesterCredits}
              onChange={(e) => setNewSemesterCredits(e.target.value)}
              className={`p-2 rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} border`}
              min="0"
            />
            <button
              onClick={addManualSemester}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              ➕ Add
            </button>
          </div>

          {/* List of Past Semesters */}
          <ul className="space-y-2">
            {pastSemesters.map((sem, index) => (
              <li key={index} className={`p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                Semester {index + 1}: GPA <strong>{sem.gpa}</strong>, Credits <strong>{sem.credits}</strong>
              </li>
            ))}
          </ul>

          <div className="mt-4 font-bold text-lg">
            Total CGPA: <span className="text-xl">{calculateCGPA()}</span>
          </div>
        </section>

        {/* Instructions Section */}
        <section className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">📝 How to Use</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Select or enter your current semester courses.</li>
            <li>Choose credit hours and grades for each course.</li>
            <li>Your SGPA will update in real-time below the table.</li>
            <li>Click "Save Semester" to store that SGPA for CGPA calculation.</li>
            <li>You can also manually enter previous semester SGPA + credit hours and click "Add".</li>
            <li>The CGPA section will automatically update with your cumulative GPA!</li>
          </ol>
        </section>
      </main>

      {/* Export Button - Outside exportRef */}
      <div className="container mx-auto px-4 pb-6 flex justify-center">
        <button
          onClick={exportToPDF}
          className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          📄 Export to PDF
        </button>
      </div>

      {/* Hidden Exportable Section */}
      <div ref={exportRef} style={{ display: 'none' }}>
        <div className={`p-6 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
          <h2 className="text-xl font-bold">📄 GPA & CGPA Report</h2>

          <h3 className="mt-4 font-semibold">📚 Courses:</h3>
          <ul>
            {courses.map((course) => (
              <li key={course.id}>
                {course.name} | {course.credits} CH | Grade: {course.grade}
              </li>
            ))}
          </ul>

          {currentSemesterGpa && (
            <div className="mt-4">
              <p><strong>Semester GPA:</strong> {currentSemesterGpa}</p>
              <p><strong>Credit Hours:</strong> {totalCredits}</p>
              <p><strong>Status:</strong> {academicStanding}</p>
            </div>
          )}

          <h3 className="mt-4 font-semibold">📈 CGPA:</h3>
          <p>{calculateCGPA()}</p>

          <h3 className="mt-4 font-semibold">🧮 Past Semesters:</h3>
          <ul>
            {pastSemesters.map((sem, index) => (
              <li key={index}>
                Semester {index + 1}: GPA {sem.gpa}, Credits {sem.credits}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-3 rounded-full shadow-lg transition-transform transform hover:scale-110 ${
          darkMode ? 'bg-blue-500' : 'bg-blue-600'
        } text-white`}
      >
        ▲
      </button>

      {/* Footer */}
      <footer className={`py-4 text-center ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'}`}>
        <p>Made by Saeed Ur Rehman – BCS233057</p>
      </footer>
    </div>
  );
}