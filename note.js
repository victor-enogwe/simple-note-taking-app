function NoteStore() {
  let notes = localStorage.getItem('notes')
  if (!notes) localStorage.setItem('notes', this.saveNotes())
}

function fetchNotes() {
  return JSON.parse(localStorage.getItem('notes'))
}

function fetchNotesArray() {
  return Object.values(this.fetchNotes()).sort((a, b) => a['id'] - b['id'])
}

function saveNotes(notes = {}) {
  return localStorage.setItem('notes', JSON.stringify(notes))
}

function deleteNotes() {
  return saveNotes()
}

function Note(note) {
  this.id = note.id || Date.now()
  this.title = note.title
  this.content = note.content
  this.color = note.color || 'bg-light'
}

function noteHtml() {
  const { id, title, content, color } = this
  const textColor = color !== 'bg-light' ? 'text-white' : ''
  const date = new Date(id)
  return `<div id="${id}" class="note col-md-6 p-3" data-id="${id}" data-title="${title}" data-content="${content}" data-color="${color}">
    <div class="card w-100 h-100 ${textColor} ${color}">
      <div class="card-body overflow-y-scroll">
        <h3 class="card-title">${title}</h3>
        <p class="card-text">${content}</p>
      </div>
      <div class="d-flex justify-content-between card-footer">
        <p class="mb-0"><small>created on ${date.toLocaleDateString()} ${date.toLocaleTimeString()}</small></p>
        <div>
          <button class="btn btn-sm btn-danger mr-3" data-id="${id}" type="button" onclick="deleteNoteHtml(event)">
            Delete
          </button>
          <button class="btn btn-sm btn-primary" data-id="${id}" type="button" onclick="editNoteHtml(event)">
            Edit
          </button>
        </div>
      </div>
    </div>
    <div>
  `
}

function renderNote() {
  const { id, title, content, color } = this
  const notes = $('#notes')
  const note = $(`#${id}`)
  const html = this.noteHtml()
  return note.length ? note.replaceWith(html) : notes.append(html)
}

function saveNote() {
  return [NoteStore.saveNotes({ ...NoteStore.fetchNotes(), [this.id]: this }), renderNote.apply(this)]
}

function deleteNote() {
  const notes = NoteStore.fetchNotes()
  delete notes[this.id]
  return NoteStore.saveNotes(notes)
}

function noteValid() {
  const { title, content, color } = this
  return [
    [/\w{2,50}/.test(title), 'noteTitleError'],
    [/.{20,200}/.test(content), 'noteContentError'],
    [/\w{2,}/.test(color), 'noteColorError']
  ]
}

function showError(fieldValidity) {
  return fieldValidity[0] ? $(`#${fieldValidity[1]}`).hide() : $(`#${fieldValidity[1]}`).show()
}

function submitNoteForm() {
  const [noteId, title, content, color] = ['noteId', 'noteTitle', 'noteContent', 'noteColor']
    .map(id => document.getElementById(id))
    .map(element => element.value)
  const note = new Note({ id: +noteId, title, content, color })
  const noteValidity = note.noteValid()
  const formValid = noteValidity.every(field => field[0])
  return formValid
    ? [note.saveNote(), $('#noteFormModal').modal('hide'), noteValidity.map(showError), $('#noteForm').trigger('reset')]
    : noteValidity.map(showError)
}

function renderNotes() {
  return $('#notes').append(NoteStore.fetchNotesArray().map(note => noteHtml.apply(note)))
}

function deleteNoteHtml(event) {
  const { id } = event.currentTarget.dataset
  const note = new Note({ id })
  return [note.deleteNote(), $(`#${id}`).remove()]
}

function editNoteHtml(event) {
  const { id } = event.currentTarget.dataset
  const { id: noteId, title, content, color } = $(`#${id}`).data()
  $('#noteId').val(noteId)
  $('#noteTitle').val(title)
  $('#noteContent').val(content)
  $('#noteColor').val(color)
  return $(`#noteFormModal`).modal('show')
}

Note.prototype.saveNote = saveNote
Note.prototype.deleteNote = deleteNote
Note.prototype.renderNote = renderNote
Note.prototype.noteHtml = noteHtml
Note.prototype.noteValid = noteValid
NoteStore.fetchNotes = fetchNotes
NoteStore.fetchNotesArray = fetchNotesArray
NoteStore.saveNotes = saveNotes
NoteStore.deleteNotes = deleteNotes
window.onload = renderNotes