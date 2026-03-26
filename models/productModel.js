import express from "express";

function productRoute(getLocalData) {
  const router = express.Router();

  //1)  - get roducts
  router.get("/products", async (req, res) => {
    try {
      const data = await getLocalData();

      res.status(200).json({ products: data });
    } catch (error) {
      console.error("error in fetching products", error);
      res.status(500).json({ msg: error.message });
    }
  });

  //2) -- get categories
  router.get("/categories", async (req, res) => {
    try {
      const data = await getLocalData();

      const categories = data?.map((p) => p.category || []);
      const cats = new Set(categories);
      res.status(200).json({ categories: [...cats], status: true });
    } catch (error) {
      console.error("category error: ", error);
      res.status(500).json({ error: error });
    }
  });

  //3) -- get searched products
  router.get("/search/:query", async (req, res) => {
    const { query } = req.params;
    if (!query) return;
    try {
      const data = await getLocalData();

      const searched = data?.filter((d) =>
        d?.name?.toLowerCase().includes(query.toLowerCase()),
      );
      console.log(searched);
      res.status(200).json(searched);
    } catch (error) {
      console.error("category error: ", error);
      res.status(500).json({ error: error });
    }
  });
  
  // get products by category
  router.get("/products/:cat", async (req, res) => {
    const { cat } = req.params;
    try {
      const products = await getLocalData();
      const sorted = products.filter((p) => p.category === cat);
      if (!sorted)
        res.status(400).json({ msg: "requested category products not found" });
      res.status(200).json(sorted);
    } catch (error) {
      res.status(500).json({ msg: "category products error", error: error });
    }
  });

  return router;
}

export default productRoute;
