import Footer from "../components/Footer";
import { useParams } from 'react-router-dom';

//displaying products based on the category
const GiftshopCategoryPage = () =>{
    /*extract category name from url, once i get that i can use the categoryname to fetch from api.
    lowkey should prob use id cause of uniqueness idkkk */
    const{categoryName} = useParams();
    return(
        <div className = "CategoryPage-wrapper">
    <h1>{categoryName}</h1>
    </div>
    )
}
export default GiftshopCategoryPage;