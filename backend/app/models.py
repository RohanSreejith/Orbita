from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base

# 1. Master Catalog (Universal items)
class GlobalProduct(Base):
    __tablename__ = "global_products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)
    image_url = Column(String)
    description = Column(String, default="Premium quality item.")
    
    # Relationships
    store_items = relationship("StoreInventory", back_populates="product")
    supplier_items = relationship("SupplierCatalog", back_populates="product")

# 2. Stores (Retailers)
class Store(Base):
    __tablename__ = "stores"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    location = Column(String)
    
    inventory = relationship("StoreInventory", back_populates="store")

# 3. Store Inventory (What a specific store has)
class StoreInventory(Base):
    __tablename__ = "store_inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    product_id = Column(Integer, ForeignKey("global_products.id"))
    
    price = Column(Float)
    stock = Column(Integer)
    min_stock_threshold = Column(Integer, default=10)
    
    store = relationship("Store", back_populates="inventory")
    product = relationship("GlobalProduct", back_populates="store_items")

# 4. Suppliers
class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    reliability = Column(Integer) # 0-100
    delivery_days = Column(Integer)
    
    catalog = relationship("SupplierCatalog", back_populates="supplier")

# 5. Supplier Catalog (What they sell & cost)
class SupplierCatalog(Base):
    __tablename__ = "supplier_catalog"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    product_id = Column(Integer, ForeignKey("global_products.id"))
    
    wholesale_cost = Column(Float)
    
    supplier = relationship("Supplier", back_populates="catalog")
    product = relationship("GlobalProduct", back_populates="supplier_items")

class Sale(Base):
    __tablename__ = "sales"
    
    id = Column(Integer, primary_key=True, index=True)
    # Linked to Store Inventory, not Global Product directly
    store_inventory_id = Column(Integer, ForeignKey("store_inventory.id")) 
    quantity = Column(Integer)
    timestamp = Column(Float) # Unix timestamp

# 7. Reviews
class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("global_products.id")) 
    store_id = Column(Integer, ForeignKey("stores.id")) # NEW: Specific to a store
    user_name = Column(String) 
    rating = Column(Integer) 
    comment = Column(String)
    timestamp = Column(Float)

# 8. B2B Orders (Agent or Manual)
class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    product_id = Column(Integer, ForeignKey("global_products.id"))
    
    quantity = Column(Integer)
    status = Column(String, default="Pending") # Pending, Shipped, Delivered
    timestamp = Column(Float)
    
    store = relationship("Store")
    supplier = relationship("Supplier")
    product = relationship("GlobalProduct")
