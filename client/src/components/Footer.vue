<script setup>
const currentYear = new Date().getFullYear()

</script>

<template>
<footer class="footer dark:bg-dark-background bg-light-background">
    <div class="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div class="sm:flex sm:items-center sm:justify-between">
            <a href="/" class="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                <img src="https://res.cloudinary.com/ddv5jvvvg/image/upload/v1708819696/dark_vg_tracker_logo_gtotka.png" class="h-8" alt="Flowbite Logo" />
                <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Backloggr</span>
            </a>
            <ul class="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
                <li>
                    <router-link to="/about" class="hover:underline me-4 md:me-6">About</router-link>
                </li>
                <li>
                    <router-link to="/contact" class="hover:underline">Contact</router-link>
                </li>
            </ul>
        </div>
        <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span class="block text-sm text-gray-500 sm:text-center dark:text-gray-400">© {{ currentYear }} <a href="/" class="hover:underline">Backloggr</a>. All Rights Reserved.</span>
    </div>
</footer>
</template>

<style scoped>
.footer {
  flex-shrink: 0;
}
</style>