import React from "react";
import "./Assign.css"; // Make sure to create Assign.css for styling
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import logog from "../assests/logog.png"; // Adjust the path as necessary
export default function Assign() {
  const company = {
    name: "GeoPlanet Solution Pvt. Ltd.",
    logo: "https://via.placeholder.com/100", // Replace with actual logo URL
    address: "408 , GPSPL , JTM, Railway Station, opposite Jagatpura, near Jtm Mall, Model Town, Jagatpura, Jaipur, Rajasthan 302017",
  };

  const letterDetails = {
    letterNo: "GP/HR/2025/004",
    date: "14 Aug 2025",
    employeeName: "John Manager",
    employeeId: "EMP-102",
    designation: "Project Manager",
    department: "Operations",
    subject: "Assignment to Project Alpha",
    description:
      "You are hereby assigned as the Project Manager for Project Alpha. Your responsibilities will include overseeing the project execution, coordinating with cross-functional teams, managing timelines, and ensuring quality deliverables.",
    startDate: "20 Aug 2025",
    endDate: "20 Dec 2025",
    location: "Head Office, Jaipur",
    reportingManager: "Sarah Admin - Senior Operations Head",
    terms: [
      "Complete the project within the assigned deadlines.",
      "Maintain confidentiality of all project-related documents.",
      "Report progress weekly to your reporting manager.",
    ],
    issuer: {
      name: "Sarah Admin",
      designation: "Senior Operations Head",
    },
  };

  return (
    <>
      <Sidebar/>
      <Navbar title="Assignment Letter" />
      <div className="assignment-letter-container">
        {/* Header */}
        <div className="letter-header">
          <img src={logog} alt="Company Logo" className="company-logo" />
          <div className="company-info">
            <h2>{company.name}</h2>
            <p>{company.address}</p>
          </div>
        </div>
        <hr />

        {/* Letter Details */}
        <div className="letter-meta">
          <p><strong>Letter No:</strong> {letterDetails.letterNo}</p>
          <p><strong>Date:</strong> {letterDetails.date}</p>
        </div>

        {/* Recipient */}
        <div className="recipient-details">
          <p><strong>To,</strong></p>
          <p>{letterDetails.employeeName}</p>
          <p>{letterDetails.designation}, {letterDetails.department}</p>
          <p>Employee ID: {letterDetails.employeeId}</p>
        </div>

        {/* Subject */}
        <p className="subject"><strong>Subject:</strong> {letterDetails.subject}</p>

        {/* Body */}
        <div className="letter-body">
          <p>{letterDetails.description}</p>
          <p><strong>Assignment Start Date:</strong> {letterDetails.startDate}</p>
          <p><strong>Assignment End Date:</strong> {letterDetails.endDate}</p>
          <p><strong>Location:</strong> {letterDetails.location}</p>
          <p><strong>Reporting Manager:</strong> {letterDetails.reportingManager}</p>

          <h4>Terms & Conditions:</h4>
          <ul>
            {letterDetails.terms.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ul>
        </div>

        {/* Authorization */}
        <div className="signature-section">
          <p>Sincerely,</p>
          <p><strong>{letterDetails.issuer.name}</strong></p>
          <p>{letterDetails.issuer.designation}</p>
        </div>

        {/* Acknowledgement */}
        <div className="acknowledgement">
          <h4>Acknowledgement</h4>
          <p>I, {letterDetails.employeeName}, acknowledge and accept the terms and conditions of this assignment.</p>
          <br />
          <p>Signature: _____________________</p>
          <p>Date: _____________________</p>
        </div>
      </div>
    </>
  );
}
