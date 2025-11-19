# Cognita: A Modern Online Education Platform

A visually stunning and interactive frontend for a modern online education platform, designed with a whimsical illustrative style.

[cloudflarebutton]

Cognita is a modern, and interactive online education platform. Designed with an 'Illustrative' artistic style, it aims to make learning engaging and delightful. The platform features a beautiful landing page to attract new users, a comprehensive course discovery page with advanced filtering, detailed pages for each course including curriculum and reviews, and a personalized dashboard for enrolled students. The user interface is built with exceptional attention to visual detail, employing a sophisticated color palette, elegant typography, and playful, custom illustrations to create a human-centered and expressive learning environment.

## Key Features

-   **Stunning Illustrative Design:** A unique, whimsical, and friendly personality that makes learning delightful.
-   **Engaging Homepage:** A captivating hero section, featured courses, and testimonials to draw users in.
-   **Comprehensive Course Catalog:** Easily browse, search, and filter a wide range of courses.
-   **Detailed Course Pages:** In-depth information including curriculum, instructor bios, and student reviews.
-   **Personalized Dashboard:** A central hub for students to track their progress and manage enrolled courses.
-   **Fully Responsive:** A seamless experience across all devices, from mobile phones to desktops.

## Technology Stack

-   **Frontend:** React, Vite, TypeScript
-   **Routing:** React Router DOM
-   **Styling:** Tailwind CSS
-   **UI Components:** shadcn/ui
-   **State Management:** Zustand
-   **Animations:** Framer Motion
-   **Icons:** Lucide React
-   **Deployment:** Cloudflare Workers

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/cognita-education-platform.git
    ```

2.  **Navigate to the project directory:**
    ```sh
    cd cognita-education-platform
    ```

3.  **Install dependencies:**
    ```sh
    bun install
    ```

## Development

To start the local development server, run the following command:

```sh
bun run dev
```

This will start the Vite development server, and you can view the application by navigating to `http://localhost:3000` in your web browser. The server supports hot-reloading, so any changes you make to the source code will be reflected instantly.

## Building for Production

To create a production-ready build of the application, run:

```sh
bun run build
```

This command bundles the application and outputs the static files to the `dist` directory, ready for deployment.

## Deployment

This project is configured for easy deployment to Cloudflare Pages/Workers.

To deploy your application, simply run the following command:

```sh
bun run deploy
```

This will trigger the build process and deploy the application using Wrangler.

Alternatively, you can deploy directly from your GitHub repository with a single click.

[cloudflarebutton]

## License

This project is licensed under the MIT License.