import {View} from 'react-native';

import {MotiView} from 'moti';
import {Dimensions, ScrollView} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Skeleton} from 'moti/skeleton';

const Spacer = ({height = 16}) => <MotiView style={{height}} />;

const HomeScreenSkeleton = () => {
  const insets = useSafeAreaInsets();
  const windowWidth = Dimensions.get('window').width;

  const colorMode = 'dark';
  const colors = ['#444D61', '#181A21'];

  return (
    <View className="flex-1 bg-bgPrimary" style={{paddingTop: insets.top}}>
      <MotiView
        className="flex-1"
        from={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{
          type: 'timing',
          duration: 500,
        }}>
        <ScrollView
          className="flex-1 px-3"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1">
            {/* User header skeleton - match the profile button with icon and text */}
            <View className="flex-row items-start justify-start">
              <View className="my-6 ml-3 flex-row items-center gap-3">
                <Skeleton
                  colorMode={colorMode}
                  radius="round"
                  height={48}
                  width={48}
                  colors={colors}
                />
                <View>
                  <Skeleton
                    colorMode={colorMode}
                    width={120}
                    height={20}
                    colors={colors}
                  />
                  <Spacer height={8} />
                  <Skeleton
                    colorMode={colorMode}
                    width={80}
                    height={20}
                    colors={colors}
                  />
                </View>
              </View>
            </View>

            {/* Loan card skeleton - match LoanCard carousel component */}
            <MotiView
              className="relative -mx-3 mb-4"
              from={{opacity: 0, translateY: 20}}
              animate={{opacity: 1, translateY: 0}}
              transition={{
                type: 'timing',
                duration: 600,
                delay: 300,
              }}>
              <View style={{flexDirection: 'row', marginLeft: 10}}>
                {/* Main visible loan card */}
                <View style={{zIndex: 2}}>
                  <View
                    style={{
                      width: windowWidth * 0.59,
                      height: windowWidth * 0.85,
                      borderRadius: 16,
                      overflow: 'hidden',
                      marginRight: 15,
                    }}>
                    {/* Top part of loan card */}
                    <View style={{flex: 2}}>
                      <Skeleton
                        colorMode={colorMode}
                        width={windowWidth * 0.59}
                        height={windowWidth * 0.56}
                        radius={0}
                        colors={colors}
                      />
                    </View>

                    {/* Bottom part of loan card */}
                    <View style={{flex: 1}}>
                      <Skeleton
                        colorMode={colorMode}
                        width={windowWidth * 0.59}
                        height={windowWidth * 0.29}
                        radius={0}
                        colors={colors}
                      />
                    </View>

                    {/* Fake loan card button */}
                    <View
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        left: 0,
                        right: 0,
                        alignItems: 'center',
                      }}>
                      <Skeleton
                        colorMode={colorMode}
                        width={150}
                        height={35}
                        radius="round"
                        colors={colors}
                      />
                    </View>
                  </View>
                </View>

                {/* Secondary card (appears smaller due to carousel's parallax effect) */}
                <View
                  style={{
                    position: 'absolute',
                    left: windowWidth * 0.65,
                    top: 0,
                    zIndex: 1,
                    transform: [{scale: 0.93}],
                    opacity: 0.8,
                  }}>
                  <View
                    style={{
                      width: windowWidth * 0.59,
                      height: windowWidth * 0.85,
                      borderRadius: 16,
                      overflow: 'hidden',
                    }}>
                    {/* Top part */}
                    <View style={{flex: 2}}>
                      <Skeleton
                        colorMode={colorMode}
                        width={windowWidth * 0.59}
                        height={windowWidth * 0.56}
                        radius={0}
                        colors={colors}
                      />
                    </View>

                    {/* Bottom part */}
                    <View style={{flex: 1}}>
                      <Skeleton
                        colorMode={colorMode}
                        width={windowWidth * 0.59}
                        height={windowWidth * 0.29}
                        radius={0}
                        colors={colors}
                      />
                    </View>
                  </View>
                </View>
              </View>
              <View className="-mx-4 mt-4 border-[0.2px] border-b border-gray-600" />
            </MotiView>

            {/* Payment Tab Skeleton */}
            <MotiView
              className="mt-5"
              from={{opacity: 0, translateY: 20}}
              animate={{opacity: 1, translateY: 0}}
              transition={{
                type: 'timing',
                duration: 600,
                delay: 400,
              }}>
              {/* Tab Bar */}
              <View className="h-14 flex-row rounded-xl bg-bgSecondary">
                {/* First Tab - Active */}
                <View
                  style={{
                    backgroundColor: '#9C4FDD',
                    margin: 4,
                    flex: 1,
                    borderRadius: 8,
                  }}
                  className="items-center justify-center">
                  <Skeleton
                    colorMode={colorMode}
                    width={80}
                    height={16}
                    colors={['#B173E8', '#9C4FDD']}
                  />
                </View>

                {/* Second Tab - Inactive */}
                <View
                  style={{
                    backgroundColor: '#222630',
                    margin: 4,
                    flex: 1,
                    borderRadius: 8,
                  }}
                  className="items-center justify-center">
                  <Skeleton
                    colorMode={colorMode}
                    width={80}
                    height={16}
                    colors={colors}
                  />
                </View>
              </View>
            </MotiView>

            {/* Tab Content - Active Loans Section */}
            <MotiView
              className="relative z-10 mt-5 rounded-lg bg-bgLight px-5 py-6"
              from={{opacity: 0, translateY: 10}}
              animate={{opacity: 1, translateY: 0}}
              transition={{type: 'timing', duration: 300}}>
              <Skeleton
                colorMode={colorMode}
                width={120}
                height={16}
                colors={colors}
              />
              <View className="width-full mb-4 mt-2 h-px bg-gray-500" />

              {/* Loan items */}
              <View>
                {Array(2)
                  .fill(0)
                  .map((_, i) => (
                    <View key={i} className="mb-4 rounded-lg bg-[#1E2127] p-4">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Skeleton
                            colorMode={colorMode}
                            width={44}
                            height={44}
                            radius={8}
                            colors={colors}
                          />
                          <View className="ml-3">
                            <Skeleton
                              colorMode={colorMode}
                              width={120}
                              height={16}
                              colors={colors}
                            />
                            <Spacer height={4} />
                            <Skeleton
                              colorMode={colorMode}
                              width={80}
                              height={12}
                              colors={colors}
                            />
                          </View>
                        </View>
                        <Skeleton
                          colorMode={colorMode}
                          width={60}
                          height={20}
                          colors={colors}
                        />
                      </View>

                      <Spacer height={16} />

                      <View>
                        <Skeleton
                          colorMode={colorMode}
                          width={150}
                          height={14}
                          colors={colors}
                        />
                        <Spacer height={8} />
                        <Skeleton
                          colorMode={colorMode}
                          width={'100%'}
                          height={8}
                          radius={4}
                          colors={colors}
                        />
                      </View>
                    </View>
                  ))}
              </View>
            </MotiView>

            {/* Banner carousel skeleton - match BannerCarousel dimensions */}
            <MotiView
              className="mb-25 -mx-3 mt-5"
              from={{opacity: 0, scale: 0.95}}
              animate={{opacity: 1, scale: 1}}
              transition={{
                type: 'timing',
                duration: 600,
                delay: 700,
              }}>
              <View className="flex-row items-center">
                {/* Primary banner */}
                <View className="mx-3">
                  <Skeleton
                    colorMode={colorMode}
                    width={windowWidth - 80}
                    height={180}
                    radius={24}
                    colors={colors}
                  />
                </View>

                {/* Secondary banner (appears partially to indicate carousel) */}
                <View
                  style={{
                    position: 'absolute',
                    right: 0,
                    transform: [{scale: 0.9}],
                    opacity: 0.6,
                  }}>
                  <Skeleton
                    colorMode={colorMode}
                    width={windowWidth - 80}
                    height={180}
                    radius={24}
                    colors={colors}
                  />
                </View>
              </View>
            </MotiView>
          </View>
          <View className="h-[120px]" />
        </ScrollView>
      </MotiView>
    </View>
  );
};

export default HomeScreenSkeleton;
