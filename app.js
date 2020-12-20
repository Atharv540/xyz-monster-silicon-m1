
var lastUrl, image_present, ready, entry, displayed_images, authors, displayed_author, displayed_stuff, 
authenticated, preview_given;

const search_input = document.querySelector('#search_input');
const sign_up_email = document.querySelector('#sign_up_email');
const sign_up_password = document.querySelector('#sign_up_password');
lastUrl = '';
image_present = 0;
ready = 0;
entry = 0;
displayed_images = [];
authors = [];
displayed_author = false;
displayed_stuff = false;
authenticated = true;
preview_given = false;

addUser = async () => {
    const email = document.querySelector('#signup-email').value;
    const password = document.querySelector('#signup-password').value;
    const username = document.querySelector('#signup-username').value;
    const logoUrl = document.querySelector('#signup-logo').value;
    await auth.createUserWithEmailAndPassword(email, password).catch(function(err){
        window.alert(err);
        authenticated = false;
    })
    if(authenticated === true){
        db.collection('accounts').add({
            name: username,
            followers: 0,
            followed_users: [],
            id: email,
            logoUrl: logoUrl,
        }) 
    } 
}

const signUpForm = document.querySelector('#signup-form');
signUpForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    addUser();
    const modal = document.querySelector('#modal-signup');
    M.Modal.getInstance(modal).close();
    signUpForm.reset();
})

signUserOut = async () => {
    auth.signOut()
}

logUserIn = async () => {
    const email = document.querySelector('#login-email').value;
    const password = document.querySelector('#login-password').value;
    auth.signInWithEmailAndPassword(email, password).catch(function(err){
        window.alert(err.message);
    })

}

const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    logUserIn();
    const modal = document.querySelector('#modal-login');
    M.Modal.getInstance(modal).close();
    loginForm.reset();
})



auth.onAuthStateChanged(user=>{
    if (user){
        window.alert("You're logged in!")
        
        deleteItem = async (id) => {
            db.collection('images').doc(id).delete();
        }
        
        
    }
    else{
        window.alert("You're not signed in!");
    }
    displayImages = async (search_input_value) => {
        ready++
        if(image_present>0){
            for(x=0; x<image_present; x++){
                let element_to_remove = document.getElementById('this_image');
                element_to_remove.remove();
            }
            image_present = 0;
            displayed_images = [];
            authors = [];
            if(displayed_author === true && displayed_stuff === true){
                let div = document.getElementById('author_info');
                div.remove();
                displayed_author = false;
                displayed_stuff = false;
            }
        }
        db.collection('images').orderBy('rating', 'desc').get().then(snapshot=>{
            snapshot.docs.forEach(doc=>{
                search_input_value.value = search_input_value.value.toLowerCase();
                if(displayed_author === false){
                    let div = document.createElement('div');
                    let wrapper = document.createElement('div');
                    let heading = document.createElement('h7');
                    heading.textContent = 'Profiles you might love';
                    heading.style.color = 'white';
                    heading.style.marginLeft = '30px';
                    heading.style.fontFamily = 'Roboto';
                    div.style.display = 'inline-block';
                    wrapper.style.display = 'inline-block';
                    wrapper.style.borderRadius = '15px';
                    let br = document.createElement('br');
                    let img = document.createElement('img');
                    img.setAttribute('id', 'favorite_image');
                    div.style.display = 'inline-block';
                    div.style.position = 'relative';
                    div.style.overflow = 'hidden';
                    img.style.width = '55%';
                    img.style.height = '100%';
                    img.style.borderRadius = '15px';
                    div.style.alignItems = 'center';
                    div.style.justifyContent = 'center';
                    div.style.alignContent = 'center';
                    wrapper.style.transition = '1s'
                    wrapper.style.width = '15%';
                    wrapper.style.backgroundColor = '#db1616';
                    div.appendChild(br);
                    div.appendChild(heading);
                    div.appendChild(img);
                    wrapper.setAttribute('id', 'author_info');
                    wrapper.appendChild(div);
                    document.body.appendChild(wrapper);
                    displayed_author = true;
                }
                if((doc.data().character.toLowerCase().includes(search_input_value.value) || search_input_value.value.includes(doc.data().character.toLowerCase()) || oneSameWord(search_input_value.value, doc.data().character.toLowerCase(), doc)===true) && displayed_images.includes(doc.data().imageUrl) === false){
                    image_present++
                    let img = document.createElement('img');
                    img.setAttribute('src', doc.data().imageUrl);
                    img.setAttribute('id', 'this_image');
                    img.setAttribute('onclick', "doAsDirected('"+doc.data().imageUrl+"','"+doc.id+"','"+doc.data().character+"','"+doc.data().rating+"','"+doc.data().publisher+"')");
                    img.style.borderRadius = '15px';
                    img.style.marginLeft ='2%';
                    img.style.height = '40%';
                    img.style.marginTop = '50px';
                    document.body.appendChild(img);
                    displayed_images.push(doc.data().imageUrl);
                    authors.push(doc.data().publisher);
                }
            })
            checkForFavoriteAuthor();
        })
    }
    
    oneSameWord = async (search_value, db_value, document) => {
        search_value_split = search_value.split(' ');
        db_value_split = db_value.split(' ');
        
        for(x=0; x<search_value_split.length; x++){
            for(y=0; y<db_value_split.length; y++){
                if(search_value_split[x] === db_value_split[y] && y!==db_value_split.length && db_value_split[y] !== 'man'){
                    let value = await db.collection('images').doc(document.id).get()
                    image_present++
                    showImage(value);
                }
                else if(search_value_split[x] !== db_value_split[y] && y!==db_value_split.length){
    
                }
                else if((search_value.includes(db_value_split[y]) || db_value.includes(search_value_split[y])) && db_value_split[y] !== 'man'){
                    let value = await db.collection('images').doc(document.id).get()
                    image_present++
                    showImage(value);
                }
                else{
                    
                }
            }
        }
    }

    db.collection('images').onSnapshot(snapshot=>{
        let changes = snapshot.docChanges();
        changes.forEach(change=>{
            if(change.type === 'added' && ready>0){
                displayImages(search_input)
            }
            else if(change.type === 'removed' && ready>0){
                displayImages(search_input)
            }
        })
    })

    submitToDatabase = async () => {
        let image_input = document.querySelector('#image-url').value
        let character_input = document.querySelector('#character-name').value
        if(image_input !== null && character_input!==null){
            if(user && image_input.split('').length>2 && character_input.split('').length>2){
                db.collection('images').add({
                    imageUrl: image_input,
                    character: character_input,
                    rating: 2,
                    raters: 2,
                    total_rating_number: 4,
                    rated_users: [],
                    publisher: user['email'],
                })
                image_input.value = '';
                character_input.value = '';
            }
            else{
                window.alert('You have to sign in, to add images!');
            }
        }
    }

    const submitImageForm = document.querySelector('#submit-form');
    submitImageForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        submitToDatabase();
        const modal = document.querySelector('#modal-submit-image');
        M.Modal.getInstance(modal).close();
        submitImageForm.reset();
    })
    
    showImage = async (value) => {
        if(lastUrl !== value.data().imageUrl && displayed_images.includes(value.data().imageUrl) === false){
            let img = document.createElement('img');
            img.setAttribute('src', value.data().imageUrl);
            img.setAttribute('id', 'this_image');
            img.setAttribute('onclick', "doAsDirected('"+value.data().imageUrl+"','"+value.id+"','"+value.data().character+"','"+value.data().rating+"','"+value.data().publisher+"')");
            img.style.borderRadius = '15px';
            img.style.marginLeft ='2%';
            img.style.height = '40%';
            img.style.marginTop = '50px';
            document.body.appendChild(img);
            displayed_images.push(value.data().imageUrl);
        }
        lastUrl = value.data().imageUrl
    }
    
    doAsDirected = async (url, id, character, rating, publisher) => {
        let username = '';
        let logoUrl = '';
        await db.collection('accounts').where('id', '==', publisher).get().then(snapshot=>{
            console.log(publisher);
            snapshot.docs.forEach(doc=>{
                username = doc.data().name;
                logoUrl = doc.data().logoUrl;
            })
        })
        if(preview_given === true){
            let previous_image = document.getElementById('image_preview');
            let previous_text = document.getElementById('text_preview');
            let previous_rate_button = document.getElementById('rate_button');
            let previous_open_button = document.getElementById('open_button');
            let previous_delete_button = document.getElementById('delete_button');
            let previous_text2 = document.getElementById('text_preview2');
            let previous_text3 = document.getElementById('text_preview3');
            let previous_logo = document.getElementById('logo_preview');
            previous_image.remove();
            previous_text.remove();
            previous_rate_button.remove();
            previous_open_button.remove();
            previous_delete_button.remove();
            previous_text2.remove();
            previous_text3.remove();
            previous_logo.remove();
        }
        let content = document.querySelector('#image-options-content');
        let button = document.createElement('button');
        let button2 = document.createElement('button');
        let button3 = document.createElement('button');
        let follow_button = document.createElement('button');
        let p = document.createElement('p');
        let p2 = document.createElement('p');
        let p3 = document.createElement('p');
        p.textContent = 'Character: '+character;
        p.style.color = 'red';
        p2.textContent = 'Rating: '+rating;
        p2.style.color = 'red';
        p3.textContent = 'Publisher: '+username+' , Email: '+publisher;
        p3.style.color = 'red';
        p.style.fontFamily = 'Roboto';
        p2.style.fontFamily = 'Roboto';
        p3.style.fontFamily = 'Roboto';
        p.setAttribute('id', 'text_preview');
        p2.setAttribute('id', 'text_preview2');
        p3.setAttribute('id', 'text_preview3');
        button.setAttribute('class', 'btn red');
        button.setAttribute('id', 'rate_button');
        button2.setAttribute('class', 'btn red');
        button2.setAttribute('id', 'open_button');
        button3.setAttribute('class', 'btn red');
        button3.setAttribute('id', 'delete_button');
        button3.setAttribute('class', 'btn red');
        button3.setAttribute('id', 'delete_button');
        button.textContent = "Rate";
        button2.textContent = "Open";
        button3.textContent = "Delete";
        let img = document.createElement('img');
        let logo = document.createElement('img');
        let br = document.createElement('br');
        img.setAttribute('src', url);
        img.setAttribute('id', 'image_preview');
        img.setAttribute('height', '200px');
        img.style.borderRadius = '15px';
        logo.setAttribute('src', logoUrl);
        logo.setAttribute('id', 'logo_preview');
        logo.setAttribute('height', '100px');
        logo.style.borderRadius = '15px';
        content.appendChild(img);
        content.appendChild(p);
        content.appendChild(p2);
        content.appendChild(p3);
        content.appendChild(logo);
        content.appendChild(button);
        content.appendChild(button2);
        content.appendChild(button3);
        preview_given = true;
        const modal = document.querySelector('#modal-image-options');
        M.Modal.getInstance(modal).open();
        let this_user = undefined
        await db.collection('images').doc(id).get().then(snapshot=>{
            this_user = snapshot.data().publisher
        })
        if((user) && user['email'] === this_user){
            let directions = window.prompt('Type "delete" to delete this image, or "open" to open this image in  new tab or "Rate" to rate this image', 'Open').toLowerCase();
            if(directions === 'delete'){
                deleteItem(id);
            }
            else if(directions === 'open'){
                openItemInNewWindow(url);
            }
            else if(directions === 'rate' && user){
                let current_raters = undefined
                let current_total_rating_number = undefined
                current_rated_users = undefined
                user_rated = undefined
                let rating_input = window.prompt('How much do you rate this image?');
                await db.collection('images').doc(id).get().then(documents=>{
                    user_rated = documents.data().rated_users;
                })
                if(rating_input<=5 && user_rated.includes(user['email'])===false && rating_input>=1){
                    await db.collection('images').doc(id).get().then(snapshot=>{
                        current_raters = snapshot.data().raters;
                        current_total_rating_number = snapshot.data().total_rating_number;
                        current_rated_users = snapshot.data().rated_users;
                        current_rated_users.push(user);
                    })
                    db.collection('images').doc(id).update({
                        rating: (current_total_rating_number+parseFloat(rating_input))/(current_raters+1),
                        total_rating_number: current_total_rating_number+parseFloat(rating_input),
                        raters: current_raters+1,
                        rated_users: firebase.firestore.FieldValue.arrayUnion(user['email']),
                    })
                }
                else if(user_rated.includes(user['email'])){
                    window.alert('You already rated this image!')
                }
                else{
                    window.alert('This rating '+rating_input+' is too much or too less , only rate numbers below 5!');
                }
            }
        }
        else if(user){
            let directions = window.prompt('Type "open" to open this image in  new tab or "Rate" to rate this image', 'Open').toLowerCase();
            if(directions === 'open'){
                openItemInNewWindow(url);
            }
            else if(directions === 'rate' && user){
                let current_raters = undefined
                let current_total_rating_number = undefined
                current_rated_users = undefined
                user_rated = undefined
                let rating_input = window.prompt('How much do you rate this image?');
                await db.collection('images').doc(id).get().then(documents=>{
                    user_rated = documents.data().rated_users;
                })
                if(rating_input<=5 && user_rated.includes(user['email'])===false && rating_input>=1){
                    await db.collection('images').doc(id).get().then(snapshot=>{
                        current_raters = snapshot.data().raters;
                        current_total_rating_number = snapshot.data().total_rating_number;
                        current_rated_users = snapshot.data().rated_users;
                        current_rated_users.push(user);
                    })
                    db.collection('images').doc(id).update({
                        rating: (current_total_rating_number+parseFloat(rating_input))/(current_raters+1),
                        total_rating_number: current_total_rating_number+parseFloat(rating_input),
                        raters: current_raters+1,
                        rated_users: firebase.firestore.FieldValue.arrayUnion(user['email']),
                    })
                }
                else if(user_rated.includes(user['email'])){
                    window.alert('You already rated this image!')
                }
                else{
                    window.alert('This rating '+rating_input+'is too much, only rate numbers below 5 and above 1!');
                }
            }
        }
        else{
            openItemInNewWindow(url);
        }
    }
    
    openItemInNewWindow = async (url) => {
        window.open(url);
    }

    checkForFavoriteAuthor = async () => {
        let favoriteAuthor = authors[0];
        for(let y = 0; y<authors.length; y++){
            if(countOccurences(authors, authors[y])>favoriteAuthor){
                favoriteAuthor = authors[y];
            }
        }
        changeImage(favoriteAuthor);
    }

    countOccurences = async (list, item) => {
        amount = 0;
        for(let x = 0; x<list.length; x++){
            if(list[x] === item){
                amount++
            }
        }
        return amount
    }

    changeImage = async (acc) => {
            db.collection('accounts').where('id', '==', acc).get().then(snapshot=>{
                let img = document.getElementById('favorite_image');
                let div = document.getElementById('author_info');
                let p = document.createElement('p');
                let p2 = document.createElement('p');
                let button = document.createElement('button');
                let bigP = document.createElement('p');
                if(displayed_stuff === false){
                    snapshot.docs.forEach(doc=>{
                        button.style.border = 'none';
                        button.style.outline = 'none';
                        button.style.padding = '10px 20px';
                        button.style.backgroundColor = 'black';
                        button.style.borderRadius = '5px';
                        button.style.color = 'white';
                        button.style.fontFamily = 'Roboto';
                        bigP.style.marginLeft = '70px';
                        button.style.marginLeft = '60px';
                        button.style.marginBottom = '10px';
                        p.style.marginLeft = '40px';
                        bigP.setAttribute('id', 'big_p');
                        img.setAttribute('src', doc.data().logoUrl);
                        img.style.marginLeft = '40px';
                        p.textContent = doc.data().name;
                        p.style.fontWeight = 'bold'
                        p2.textContent = doc.data().followers+' followers';
                        p.style.color = 'white';
                        p.style.fontFamily = 'Roboto';
                        p2.style.color = 'white';
                        p2.style.fontFamily = 'Roboto';
                        bigP.style.fontSize = '12px';
                        button.textContent = 'Follow';
                        button.setAttribute('onclick', 'followAuthor("'+doc.id+'")')
                        div.setAttribute('onmouseover', 'hoverChange(true)');
                        div.setAttribute('onmouseout', 'hoverChange(false)');
                        bigP.appendChild(p2);
                        div.appendChild(p);
                        div.appendChild(bigP);
                        div.appendChild(button)
                    })
                    displayed_stuff = true
            }
            })
    }

    followAuthor = async (id) => {
        if(user){
            let current_followers = undefined
            let current_followed_users = undefined
            let author = undefined
            await db.collection('accounts').doc(id).get().then(snapshot=>{
                current_followers = snapshot.data().followers
                current_followed_users = snapshot.data().followed_users
                author = snapshot.data().id
            })
            if(current_followed_users.includes(user['email']) === false && author!==user['email']){
                db.collection('accounts').doc(id).update({
                    followed_users: firebase.firestore.FieldValue.arrayUnion(user['email']),
                    followers: current_followers+1
                })
            }
            else if(current_followed_users.includes(user['email']) && author!==user['email']){
                window.alert('You have already followed this account!');
            }
            else{
                window.alert("You can't follow yourself!")
            }
        }
        else{
            window.alert('You have to sign in to follow.');
        }
    }

    hoverChange = async (change) => {
        if(change === true){
            let div = document.getElementById('author_info');
            div.style.backgroundColor = '#db7216';
            let text = document.getElementById('big_p')
        }
        else if(change === false){
            let div = document.getElementById('author_info');
            div.style.backgroundColor = '#db1616';            
            let text = document.getElementById('big_p')
        }
    }


})