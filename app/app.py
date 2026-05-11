import streamlit as st

st.title("Vestidor Virtual")

st.write("Bienvenida a tu Vestidor Virtual")

pagina = st.sidebar.selectbox("Ir a", ["Inicio", "Mi Ropa", "Outfits"])

if pagina == "Inicio":
    st.write("Página de Inicio")

elif pagina == "Mi Ropa":
    st.write("Aquí irá tu inventario de Ropa")
elif pagina == "Outfits":
    st.write("Aquí irán tus outfits personalizados")