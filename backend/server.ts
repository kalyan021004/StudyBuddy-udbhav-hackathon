import app from './app';

const PORT = process.env.PORT || 8080;

// ----------------- START SERVER -----------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});