import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <p>Welcome to the home page for donating crypto to your favorite streamers.</p>
      <p>Please excuse our jenky appearance, this site aims to minimze dev costs to minimze our fees.</p>
      <nav>
        <ul>
          <li>
            <Link to="/TheBacklash/chat">Chat with The Backlash (Dave, Vince, Rebecca, and Chris)</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
