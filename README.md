# Sports Pick 'Em App - README

## Overview

This project is a **Sports Pick 'Em App** that allows users to make game picks, track game results, and view leaderboards. The app supports both **NFL** and **College Football** games, providing a seamless user experience for making picks and viewing scores in **real-time**.

The app includes:

- **Responsive design** that ensures optimal performance and display on both mobile and desktop.
- A modern **dark mode** theme for improved aesthetics and usability.
- Admin panel for managing and verifying picks, allowing easy tracking of user accuracy.

## Features

### User Features:
- **Pick NFL or College Football Games:** Users can switch between NFL and College Football game lists for their picks.
- **Game Score Integration:** Scores are updated in real-time, allowing users to see the results and if their picks were correct.
- **Leaderboard:** Users can view a leaderboard of picks, seeing how many correct guesses each player has made.

### Admin Features:
- **Admin Panel:** Admins can log in and access a panel to manage user picks and verify their accuracy.
- **Score Update & Verification:** The app automatically pulls scores and verifies if users' picks were correct.
- **User Leaderboard:** Admins can view user picks and see detailed stats for each player.

### Responsive Design:
The app is fully responsive, with media queries handling mobile layouts. Cards stack vertically on mobile while maintaining a flexible, clean design on larger screens.

### Dark Mode:
The app uses a **dark mode theme** to reduce eye strain and improve visual quality. The dark theme is consistent across all components, including forms, tables, buttons, and game cards.

## Technology Stack

### Frontend:
- **React.js:** Core frontend framework used to create reusable components.
- **Ant Design (AntD):** A React UI library that provides a variety of modern components like tables, forms, and buttons.
- **Axios:** Used for handling HTTP requests to communicate with the backend API.
- **CSS & Media Queries:** Ensures responsive design and adapts the layout for mobile, tablet, and desktop views.
- **React Router:** Allows for seamless navigation between different routes in the app (e.g., leaderboard, admin panel).

### Backend:
- **Node.js/Express:** The backend API handles authentication, manages game data, and provides endpoints for picks and results.
- **MongoDB:** Used to store user data, game picks, and track game scores.
- **JWT Authentication:** Used to secure the admin login and protect the admin panel route.
- **TAK Server API**: The app uses custom APIs to interact with TAK servers for fetching data, logging user picks, and updating scores.

## Setup and Installation

### Prerequisites:
- **Node.js** and **npm** should be installed.
- **MongoDB** database running locally or remotely.
- Backend API running on the given endpoint.

### Steps to Install:

1. Clone the repository:
    ```bash
    git clone https://github.com/your-repo/sports-pick-em.git
    ```

2. Navigate to the project directory:
    ```bash
    cd sports-pick-em
    ```

3. Install dependencies:
    ```bash
    npm install
    ```

4. Start the app:
    ```bash
    npm start
    ```

5. For backend setup, ensure the backend server is running (Node.js and Express app) with MongoDB connected.

## Folder Structure

- **src/components**: Contains React components for the different pages and UI elements.
- **src/pages**: Includes pages like Home, Leaderboard, Admin Panel, and Game Picks.
- **src/styles**: Contains CSS files and theme configuration.
- **public/**: Public assets like images and fonts.
- **src/utils**: Helper functions and utilities for API calls and data formatting.

## Key Files and Components

1. **Navbar.js**: The navigation bar allowing users to switch between different views (home, leaderboard, admin).
2. **AdminViewPicks.js**: Admin view component to track user picks, display the leaderboard, and check for correct picks.
3. **GameList.js**: Displays the games for NFL or College Football, allowing users to select teams for their picks.
4. **AdminLogin.js**: Admin login page for secure access to the admin panel.
5. **Responsive CSS**: Media queries in the CSS ensure a mobile-friendly experience by stacking game cards and optimizing the UI for different screen sizes.

## CSS Styling and Dark Mode

The entire app is styled with **dark mode** enabled by default. The dark mode affects all components, including:

- Background color: `#1e1e1e`
- Card elements: Dark gray with subtle borders
- Buttons: Modern blue with hover effects
- Text: Light gray or white for clear contrast

### Responsive Design:

- **Mobile-first** design: The app uses media queries to adjust layouts for mobile devices. On mobile, game cards stack vertically, and the table adjusts to fit smaller screens.

## API Integration

The app interacts with an external API to:
1. Fetch game scores from NFL and College Football.
2. Post user picks to the backend for tracking.
3. Fetch the leaderboard to display user performance.

## Future Enhancements

- **Social Sharing**: Allow users to share their picks or leaderboard status with friends.
- **Push Notifications**: Notify users when game results are updated.
- **Enhanced Stats**: Show users their pick accuracy over time with detailed graphs and metrics.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

This project showcases how to build a dynamic sports pick 'em app using modern technologies like React, Ant Design, and Axios while adhering to good practices in responsive design and user experience.
# Football-Pickem
