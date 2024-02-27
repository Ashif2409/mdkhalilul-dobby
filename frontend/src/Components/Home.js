import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css'
export const Home = ({ data }) => {
    const [imgDetails, setImgDetails] = useState({
        name: '',
        images: [],
    });

    const [text, setText] = useState('');
    const [files, setFiles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    axios.defaults.withCredentials = true;
    const handleFile = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
    };

    const handleText = (e) => {
        setText(e.target.value);
    };

    useEffect(() => {
        axios.get("https://mdkhalilul-dobby-api.vercel.app/images")
            .then(response => {
                setImgDetails(prevState => ({
                    ...prevState,
                    images: response.data,
                }));
            })
            .catch(error => {
                console.error('Error fetching images:', error);
            });
    }, []);




    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('images', files[i]);
        }
        formData.append('name', text);
        formData.append('userId', data._id);

        axios.post('https://mdkhalilul-dobby-api.vercel.app/imgDetail', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then((response) => {
                const newImages = files.map((file) => ({
                    name: text,
                    image: URL.createObjectURL(file),
                    userId: data._id
                }));
                setImgDetails({
                    ...imgDetails,
                    images: [...imgDetails.images, ...newImages],
                });
                setText('');
                setFiles([]);
            })
            .catch((error) => {
                console.error('Error uploading images:', error);
            });
    };


    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
    };

    const filteredImages = imgDetails.images.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
        <div className="container flex justify-center items-center flex-col">
            <div className="details">
                <h1>Name: {data.name}</h1>
                <h1>Number of Images: {filteredImages.length}</h1>
            </div>
            <div className="inputs">
                <form onSubmit={handleSubmit}>
                    <input type="file" onChange={handleFile} multiple />
                    <input type="text" value={text} placeholder="Name of the Img" onChange={handleText} />
                    <button type="submit">Submit</button>
                </form>
            </div>
            <div className="search">
                <input type="text" value={searchQuery} placeholder="Search by name" onChange={handleSearch} />
            </div>
            <div className="images-container">
                <div className="images flex flex-wrap justify-center items-center m-auto">
                    {filteredImages.map((item, idx) => (
                        <div className="img-wrapper" key={idx}>
                            <img
                                src={item.imageURL ? `http://localhost:8080/uploads/${item.imageURL}` : item.image}
                                alt=""
                                className="image cursor-pointer"
                            />
                            <h1 className="img-name">{item.name}</h1>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </>    
    );
};
