import React, { useState } from 'react';
import { FileText, Plus, Search, Tag, Clock, Trash2, Save, Check } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, Note } from '../db/db.ts';
import { saveNote, deleteNote } from '../db/dbService.ts';

export const NotesView: React.FC = () => {
  const notes = useLiveQuery(() => db.notes.toArray(), []) || [];

  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('EEC');
  const [editContent, setEditContent] = useState('');
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Active note is either the selected one or first in list
  const activeNote: Note | undefined = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const handleStartEdit = (note?: Note) => {
    if (note) {
      setSelectedNoteId(note.id || null);
      setEditTitle(note.title);
      setEditCategory(note.category);
      setEditContent(note.content);
    } else {
      setSelectedNoteId(null);
      setEditTitle('');
      setEditCategory('EEC');
      setEditContent('');
    }
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    const newId = await saveNote({
      id: selectedNoteId || undefined,
      title: editTitle.trim(),
      category: editCategory,
      content: editContent.trim(),
    });

    setSelectedNoteId(newId);
    setIsEditing(false);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await deleteNote(id);
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-['Plus_Jakarta_Sans']">
            Course Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Lecture notes, formulas & lab observations (IndexedDB Persisted)
          </p>
        </div>

        <button
          onClick={() => handleStartEdit()}
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {savedFeedback && (
        <div className="px-4 py-2.5 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-200 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Note saved directly to local IndexedDB.</span>
        </div>
      )}

      {/* Editor Modal / Panel if isEditing */}
      {isEditing && (
        <form onSubmit={handleSave} className="glass-card rounded-3xl p-6 border border-cyan-400/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              {selectedNoteId ? 'Edit Note' : 'Create New Note'}
            </h3>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Note title (e.g. DLMS Circuit Logic Analysis)"
              className="sm:col-span-2 px-4 py-2 text-xs rounded-xl glass-input text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
              autoFocus
              required
            />
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl glass-input text-white bg-slate-900"
            >
              <option value="EEC">EEC</option>
              <option value="DLMS">DLMS</option>
              <option value="Signals and Systems">Signals and Systems</option>
              <option value="Maths">Maths</option>
              <option value="Medical Physics">Medical Physics</option>
              <option value="General">General</option>
            </select>
          </div>

          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Write your observation notes, key equations, and formulas..."
            rows={6}
            className="w-full px-4 py-2.5 text-xs rounded-xl glass-input text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 font-sans leading-relaxed"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save to IndexedDB</span>
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-white/10">
          <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white">No Notes in Local Database</p>
          <p className="text-xs text-slate-400 mt-1">Click "New Note" to create your first lecture or lab note.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Notes list */}
          <div className="space-y-3">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => {
                  setSelectedNoteId(note.id || null);
                  setIsEditing(false);
                }}
                type="button"
                className={`w-full text-left p-4 rounded-3xl transition-all border ${
                  activeNote?.id === note.id
                    ? 'glass-card border-cyan-400/40 bg-white/[0.12] shadow-xl'
                    : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
                  <span className="text-cyan-300 font-semibold">{note.category}</span>
                  <span className="text-[10px]">{note.updatedAt?.slice(0, 10)}</span>
                </div>
                <h4 className="text-sm font-bold text-white leading-snug break-words">{note.title}</h4>
                <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed break-words">
                  {note.content}
                </p>
              </button>
            ))}
          </div>

          {/* Note View / Detail Container */}
          {activeNote && (
            <div className="md:col-span-2 glass-card rounded-3xl p-6 sm:p-8 border border-white/20 flex flex-col justify-between min-h-[360px]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {activeNote.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{activeNote.updatedAt}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(activeNote)}
                      type="button"
                      className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(activeNote.id)}
                      type="button"
                      className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mt-4 break-words">
                  {activeNote.title}
                </h2>

                <div className="mt-6 space-y-4 text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap break-words">
                  {activeNote.content}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-slate-400">
                <span>Note #{activeNote.id}</span>
                <span className="text-cyan-300 font-medium">Local IndexedDB Notebook</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
