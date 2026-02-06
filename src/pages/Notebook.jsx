import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import "./Notebook.css";

export default function Notebook() {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingNoteId, setEditingNoteId] = useState(null);

  // Load notes
  const fetchNotes = async () => {
    try {
      const res = await api.getUserNotes(user.id);

      if (res && Array.isArray(res)) {
        setAllNotes(res);
      } else if (res && res.notes) {
        setAllNotes(res.notes);
      } else {
        setAllNotes([]);
      }
    } catch (error) {
      console.error("Error fetching notes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  // Save or Update note
  const handleSave = async () => {
    try {
      if (!title.trim() || !note.trim()) {
        alert("Please enter both a title and note.");
        return;
      }

      if (editingNoteId) {
        // 🔹 Update existing note
        await api.updateUserNote(editingNoteId, title, note);
      } else {
        // 🔹 Create new note
        await api.addUserNote(user.id, title, note);
      }

      // Clear input
      setTitle("");
      setNote("");
      setEditingNoteId(null);

      // Refresh notes
      fetchNotes();
    } catch (error) {
      console.error("Error saving notes", error);
    }
  };

  // inside handleEdit
  const handleEdit = (noteObj) => {
    setTitle(noteObj.title);
    setNote(noteObj.content);
    setEditingNoteId(noteObj.id);
  };

  // add cancel
  const handleCancel = () => {
    setTitle("");
    setNote("");
    setEditingNoteId(null);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Sidebar />
      <div className="main-content">
        <Navbar title="My Notebook" />
        <div className="notebook-container">
          {/* Left side */}
          <div className="note-editor">
            <h2>{editingNoteId ? "Edit Note" : "Create Note"}</h2>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Type your title..."
              className="note-title-input"
            />
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write your notes here..."
              rows="10"
            />
            <div className="button-group">
              {editingNoteId ? (
                <>
                  <button className="update-btn" onClick={handleSave}>
                    Update
                  </button>
                  <button className="cancel-btn" onClick={handleCancel}>
                    Cancel
                  </button>
                </>
              ) : (
                <button className="save-btn" onClick={handleSave}>
                  Save
                </button>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="saved-notes">
            <h2>Saved Notes</h2>
            {allNotes.length === 0 ? (
              <p>No notes yet.</p>
            ) : (
              allNotes.map((n) => (
                <div key={n.id} className="note-card">
                  <h3>{n.title}</h3>
                  <p>{n.content}</p>
                  <div className="note-actions">
                    <button onClick={() => handleEdit(n)}>Edit</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
