# Weekly Planner

A modern, web-based weekly planner built with React, Tailwind CSS, and Zustand. It features a drag-and-drop interface for planning tasks onto a weekly grid with hour-by-hour precision.

## Key Features
-   **Weekly Grid**: 7-day view (Mon-Sun) with 24-hour slots.
-   **Drag & Drop**: Easily move tasks between the "Task Bin" and any day/hour slot.
-   **Local Persistence**: All tasks are saved locally in the browser's `localStorage`.
-   **Past Day Protection**: Plans on past days are read-only and cannot be modified.
-   **Task Management**: Create, edit, and delete tasks with custom titles, descriptions, and durations.

## Tech Stack
-   **Framework**: [React](https://react.dev/) (Vite)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
-   **Drag & Drop**: [@dnd-kit/core](https://dndkit.com/)
-   **Date Handling**: [date-fns](https://date-fns.org/)
-   **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites
-   [Node.js](https://nodejs.org/) (v18+)
-   [npm](https://www.npmjs.com/)

### Installation
1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd planner
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:5173](http://localhost:5173) in your browser.

## Roadmap
See [ROADMAP.md](./ROADMAP.md) for planned features and future improvements.
