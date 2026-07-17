# My academic website

This is forked from [here](https://github.com/leonidk/new_website) with mostly only content changes.

To host locally, run `jekyll serve --incremental`

## Routes

- `/` is the gateway between the two versions.
- `/me/` is the sensible academic portfolio.
- `/fun/` is the Dadaist anti-portfolio.

Post pages are generated under `/archive/:categories/:title/` so they cannot overwrite the root gateway.

## Old text

This repo is built on a fork of **Jekyll Now** from [this repository](https://github.com/barryclark/jekyll-now). **Jekyll** is a static site generator that's perfect for GitHub hosted blogs ([Jekyll Repository](https://github.com/jekyll/jekyll))

The website design is just a modification of [Jon Barron's website](https://jonbarron.info/) and is converted for my own use, re-purposing my old markdown posts. **Feel free to use template for your own purposes**, but please respect copyright for all the images/content in my `images`, `pdfs`, `_posts` folders. 



### issues
* If you want multiple paragraphs, consider using `excerpt_separator: <!--more-->` in `_config.yml`, for my own use I didn't need this. 
* My own posts have lots of extra stuff left over from my old jekyll design ("author", long descriptions, etc.), feel free to ignore them
* I use thumbnails, so I can upload arbitrary sized images but then only display small ones. The `_make_thumbnails.sh` script generates them and the html template looks in `tn/` for all images. 
* I have three categories of post with slightly differerent formatting, so changing sizing requires edits in multiple paces. 
* If you use this, I'd appreciate a link back either to this repo or my personal website so others can find this too. 
