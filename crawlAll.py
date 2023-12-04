import multiprocessing
from selenium import webdriver  # selenium의 webdriver를 사용하기 위한 import
from selenium.webdriver.common.keys import Keys  # selenium으로 키를 조작하기 위한 import
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
import time  # 페이지 로딩을 기다리는데에 사용할 time 모듈 import
from multiprocessing import Manager


def do_multiprocessing(*args):
    category, result = args
    option = Options()
    option.add_argument("--headless")
    option.add_argument("disable-gpu")
    option.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    )

    driver = webdriver.Chrome(options=option)
    url = "https://shopsquare.shopping.naver.com/shopping?catId=00000000&freeDelivery=&order=prodRank%2CASC&randomSeed=12&searchKeyword="
    driver.get(url)
    caps = DesiredCapabilities().CHROME
    caps["pageLoadStrategy"] = "none"

    time.sleep(0.5)

    if category == "fashion":
        category_selector = "#app > div.src-shopping-product-ProductBoard-module__board_content--3sBZk > div.src-common-product-lnb-ProductLNBMenu-module__product_lnb--2zsL4 > div > ul > li:nth-child(2) > a"
    elif category == "food":
        category_selector = "#app > div.src-shopping-product-ProductBoard-module__board_content--3sBZk > div.src-common-product-lnb-ProductLNBMenu-module__product_lnb--2zsL4 > div > ul > li:nth-child(6) > a"
    elif category == "cosmetic":
        category_selector = "#app > div.src-shopping-product-ProductBoard-module__board_content--3sBZk > div.src-common-product-lnb-ProductLNBMenu-module__product_lnb--2zsL4 > div > ul > li:nth-child(4) > a"
    elif category == "sports":
        category_selector = "#app > div.src-shopping-product-ProductBoard-module__board_content--3sBZk > div.src-common-product-lnb-ProductLNBMenu-module__product_lnb--2zsL4 > div > ul > li:nth-child(8) > a"
    elif category == "living":
        category_selector = "#app > div.src-shopping-product-ProductBoard-module__board_content--3sBZk > div.src-common-product-lnb-ProductLNBMenu-module__product_lnb--2zsL4 > div > ul > li:nth-child(5) > a"
    elif category == "appliance":
        category_selector = "#app > div.src-shopping-product-ProductBoard-module__board_content--3sBZk > div.src-common-product-lnb-ProductLNBMenu-module__product_lnb--2zsL4 > div > ul > li:nth-child(9) > a"

    element = driver.find_element(By.CSS_SELECTOR, category_selector)
    time.sleep(0.5)
    element.click()
    time.sleep(0.5)
    desc_selectors = [
        "#app > div.src-shopping-product-ProductBoard-module__board_content--3sBZk > div.board_wrap > div > ul > li:nth-child("
        + str(i)
        + ") > a > div.src-common-product-item-ProductItem-module__info_area--13tlG > div.src-common-product-item-ProductItem-module__subject--1c_7j"
        for i in range(1, 10)
    ]
    price_selectors = [
        "#app > div.src-shopping-product-ProductBoard-module__board_content--3sBZk > div.board_wrap > div > ul > li:nth-child("
        + str(i)
        + ") > a > div.src-common-product-item-ProductItem-module__info_area--13tlG > div.src-common-product-item-ProductItem-module__price--1kOIJ > strong"
        for i in range(1, 10)
    ]
    image_selectors = [
        "#app > div.src-shopping-product-ProductBoard-module__board_content--3sBZk > div.board_wrap > div > ul > li:nth-child("
        + str(i)
        + ") > a > div.src-common-product-item-ProductItem-module__img_area--3X2qG > img"
        for i in range(1, 10)
    ]
    url_selectors = [
        "#app > div.src-shopping-product-ProductBoard-module__board_content--3sBZk > div.board_wrap > div > ul > li:nth-child("
        + str(i)
        + ") > a"
        for i in range(1, 10)
    ]

    print("Fetching", category)

    for d, p, i, u in zip(
        desc_selectors,
        price_selectors,
        image_selectors,
        url_selectors,
    ):
        description = driver.find_element(By.CSS_SELECTOR, d)
        price = driver.find_element(By.CSS_SELECTOR, p)
        image = driver.find_element(By.CSS_SELECTOR, i)
        url = driver.find_element(By.CSS_SELECTOR, u)

        result["descriptions"].append(description.text)
        result["prices"].append(price.text)
        result["images"].append(image.get_attribute("src"))
        result["urls"].append(url.get_attribute("href"))

    print("Fetching", category, "Done.")
    driver.quit()

    return result


def main():
    code_list = ["fashion", "food", "cosmetic", "sports", "living", "appliance"]
    di = {"descriptions": [], "urls": [], "prices": [], "images": []}

    with multiprocessing.Pool(6) as pool:
        result = pool.starmap(
            do_multiprocessing, [(code, di.copy()) for code in code_list]
        )

    pool.close()
    pool.join()
    return result


if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
