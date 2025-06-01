# ✨ KaiD: AI Adventures for Kids ✨

Welcome to the repository for **KaiD** (Kids' AI Discovery)! This project is currently shared for review purposes.

KaiD is an interactive web application designed to introduce children (especially those under 10) to the exciting world of Artificial Intelligence through fun, creative, and educational activities. Kids can generate music, create art, write stories, and learn about AI with their friendly AI companion, D.I.A. 🤖

## 🚀 Project Overview

KaiD provides a safe and engaging platform for young minds to:
* **Explore AI Creativity:** Generate unique music, images, and stories.
* **Learn AI Concepts:** Understand basic AI principles through interactive lessons and quizzes.
* **Chat with D.I.A.:** Interact with a kid-friendly AI assistant.
* **Track Progress:** See their learning journey and achievements.

## 🛠️ Technologies Used

This project is built with a modern and robust tech stack:
* **Vite**: Next-generation front-end tooling.
* **TypeScript**: JavaScript with syntax for types.
* **React**: A JavaScript library for building user interfaces.
* **shadcn-ui**: Beautifully designed components.
* **Tailwind CSS**: A utility-first CSS framework.
* **Supabase**: Backend-as-a-Service for database, authentication, and serverless functions.

## 💻 Getting Started (For Reviewers)

To review or run the project locally:
* **Prerequisites**: Node.js & npm installed ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).
* **Steps**:
    ```sh
    # Step 1: Clone the repository
    git clone <REPOSITORY_URL> # Replace <REPOSITORY_URL> with the URL of this Git repository

    # Step 2: Navigate to the project directory
    cd kaid-project-directory # Or your chosen project name

    # Step 3: Install the necessary dependencies
    npm i

    # Step 4: Start the development server
    npm run dev
    ```

## ✨ Key Features

* **User Authentication**: Secure sign-up and login (email/password & Google OAuth).
* **AI Creative Zones**:
    * 🎵 **MusicZone (Sound Cave)**: Generate AI music.
    * 🎨 **ImageZone (Art Studio)**: Create AI images.
    * 📚 **StoryTreehouse**: Write collaborative AI stories.
* **DIA Chat**: Interactive AI assistant for kids.
* **Content & Usage Limits**: Lifetime creation limits for free users and daily DIA chat limits.
* **Profile Management**: Customizable user profiles with avatars.
* **Learning Center**: Interactive lessons and progress tracking.
* **Parent Dashboard**: Overview of child's activity and progress.

## 📄 Code Structure Highlights

* **`src/components`**: Contains reusable UI components, categorized by feature (auth, creative, dia, hub, learning, onboarding, parent, shared, ui).
    * `ui/`: Base UI elements from shadcn-ui.
* **`src/pages`**: Main page components like `Index.tsx` and `NotFound.tsx`.
* **`src/hooks`**: Custom React hooks, including `useAuth.tsx` for authentication state and `useSupabaseData.tsx` for data fetching.
* **`src/integrations/supabase`**: Supabase client setup and type definitions.
* **`supabase/functions`**: Serverless functions for backend logic, including:
    * `track-usage`: Manages creation limits.
    * `track-dia-usage`: Manages chat message limits.
    * `generate-music`, `generate-image`, `generate-story`, `dia-chat`: AI content generation and interaction.
* **Configuration Files**:
    * `vite.config.ts`: Vite configuration.
    * `tailwind.config.ts`: Tailwind CSS setup.
    * `tsconfig.*.json`: TypeScript configurations.
