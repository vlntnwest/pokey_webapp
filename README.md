# **Click & Serve Web Application**

## **Project Overview**

This project is a "Click & Serve" web application developed for a Poké bowl restaurant. The primary goal is to allow customers within the restaurant to place their orders directly through a web application on their mobile devices. The orders are then sent to the kitchen and served at the customers' tables. This system is designed to streamline the ordering process, making it more efficient and convenient for both the customers and the restaurant staff.

## **Features**

### For Customers:

- **Menu Browsing:** Customers can browse through the restaurant's menu, including Poké bowls, sides, drinks, and desserts.
- **Customizable Poké Bowls:** Customers can fully customize their Poké bowls by selecting a base (rice or quinoa), one or more proteins, garnishes, toppings, and sauces.
- **Common Cart for Tables:** Multiple customers at the same table can add items to a common cart, with a final validation step before the order is sent to the kitchen.
- **Mobile-First Design:** The application is optimized for mobile devices, offering a user-friendly interface inspired by platforms like Deliveroo.

### For Restaurant Admin:

- **Order Management:** Orders placed by customers are immediately sent to the admin dashboard and automatically printed on an Epson TM30 printer in the kitchen. Admins can view, archive, or reprint orders as needed.
- **Table Management:** The admin can open or close tables via a simple toggle in the dashboard.
- **Daily History:** A history of orders is available in the admin dashboard, which resets monthly.
- **Admin Authentication:** Admin access is secured with a simple JWT-based login system.

## **Technology Stack**

- **Backend:** Node.js with Express.js
- **Database:** MongoDB
- **Frontend:** React with Material-UI
- **Printing:** Integrated with Epson TM30 printer
